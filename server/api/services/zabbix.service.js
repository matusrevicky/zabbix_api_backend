import l from '../../common/logger';
import fs from 'fs';
import path from 'path';
import Zabbix from '../../../zabbix-rpc';
import imageNames from '../../images/names.json';

class ZabbixService {
  async login(req) {
    l.info(`${this.constructor.name}.login()`);
    var z = await new Zabbix(req.session.host);
    var sessionid = await z.user.login(req.session.user, req.session.pass);
    var user = await z.user.check(sessionid);
    await z.user.logout();
    return user;
  }

  // destroys session in session store
  async logout(req) {
    l.info(`${this.constructor.name}.logout()`);
    req.session.destroy();
    return 'session destroyed';
  }

  async get_host_groups(req) {
    l.info(`${this.constructor.name}.get_host_groups()`);
    var z = await new Zabbix(req.session.host);
    await z.user.login(req.session.user, req.session.pass);
    var host_groups = await z.host.group.get();
    await z.user.logout();
    return host_groups;
  }

  async get_hosts(req) {
    l.info(`${this.constructor.name}.get_hosts()`);
    var z = await new Zabbix(req.session.host);
    await z.user.login(req.session.user, req.session.pass);

    const groupids = req.body.groupids;
    const params = {
      groupids: groupids,
    };

    const hosts = await z.host.get(params);
    const result = hosts.map(async (host) => {
      const params = {
        filter: {
          name: host.name + ' MAP',
        },
      };
      const map = await z.map.get(params);
      if (map[0]) {
        host.map_link = this.createMapLink(z, map[0].sysmapid);
      }
      return host;
    });
    const hostsWithMap = await Promise.all(result);
    await z.user.logout();
    return hostsWithMap;
  }


  async create_maps(req) {
    l.info(`${this.constructor.name}.create_maps()`);
    var z = await new Zabbix(req.session.host);
    await z.user.login(req.session.user, req.session.pass);

    const images = await this.prepare_images(z);
    const hostids = req.body.hostids;
    const promises = hostids.map(async (hostid) => {
      return this.create_map(z, hostid, images);
    });

    var results = await Promise.all(promises);
    await z.user.logout();
    return results;
  }


  /******** Below are just helper functions **********/

  async create_map(z, hostid, images) {
    l.info(`${this.constructor.name}.create_map(${hostid})`);
    
    
    const triggers = await this.get_triggers_by_hostid(z, hostid);
    // console.log(triggers)
    const mapSize = this.compute_map_size(triggers.length, 50);
    const hosts = await this.get_hosts_by_id(z, hostid);
    const map = this.create_map_params(hosts[0], triggers, mapSize, images, 50);
    
    console.time('mapcreate' + map.name);
    const response = await z.map.create(map);
    console.timeEnd('mapcreate' + map.name);

    if (response.sysmapids) {
      return this.createMapLink(z, response.sysmapids[0]);
    } else {
      return response;
    }
  }

  createMapLink(z, sysmapid) {
    return z.req.host + '/zabbix.php?action=map.view&sysmapid=' + sysmapid;
  }

  create_map_params(host, triggers, mapSize, images, gap) {
    const selements = this.create_selements(triggers, images, gap);
    const params = {
      name: host.name + ' MAP',
      width: mapSize[0],
      height: mapSize[1],
      label_format: 1,
      label_type_trigger: 0,
      selements: selements,
    };
    return params;
  }

  get_image_id(images, name) {
    return images.find((image) => image.name == name).imageid;
  }

  create_selements(triggers, images, gap) {
    let x = 50;
    let y = 100;
    const label_locationUp = 3;
    const label_locationDown = 0;
    const iconsDownIds = imageNames.iconsDown.map((name) => {
      return this.get_image_id(images, name);
    });
    const iconsUpIds = imageNames.iconsUp.map((name) => {
      return this.get_image_id(images, name);
    });

    const selements = triggers.map((trigger, index) => {
      let element;

      if (index % 2 == 1) {
        y = 150;
        element = this.create_element(
          trigger.triggerid,
          trigger.label,
          label_locationDown,
          iconsDownIds,
          x,
          y
        );
        x += gap;
      } else {
        y = 100;
        element = this.create_element(
          trigger.triggerid,
          trigger.label,
          label_locationUp,
          iconsUpIds,
          x,
          y
        );
      }

      return element;
    });

    return selements;
  }

  create_element(triggerid, label, label_location, iconsIds, x, y) {
    const element = {
      elements: [{ triggerid: triggerid }],
      label_location: label_location,
      label: label,
      elementtype: 2,
      iconid_off: iconsIds[0],
      iconid_disabled: iconsIds[1],
      iconid_maintenance: iconsIds[2],
      iconid_on: iconsIds[3],
      x: x,
      y: y,
    };
    return element;
  }

  compute_map_size(triggers_count, gap) {
    const width = (triggers_count / 2 + 1) * gap;
    return [width, 300];
  }

  get_hosts_by_id(z, hostids) {
    const params = {
      hostids: hostids,
    };
    return z.host.get(params);
  }

  async get_triggers_by_hostid(z, hostid) {
    const params = {
      filter: {
        hostid: hostid,
      },
    };
    const triggers = await z.trigger.get(params);

    let filtered = [];
    triggers.forEach((trigger) => {
      if (trigger.description.includes('Link down')) {
        const name = trigger.description;
        const label = name.substring(
          name.lastIndexOf('/') + 1,
          name.indexOf('(')
        );
        trigger.label = Number(label);
        // sometimes triggers in zabbix do not have labels, but they should
        // console.log(trigger.label);
        // console.log(typeof trigger.label)
        filtered.push(trigger);
      }
    });

    filtered.sort((a, b) => a.label - b.label);
    return filtered;
  }

  async prepare_images(z) {
    l.info(`${this.constructor.name}.prepare_images()`);
    const imagesDirPath = path.resolve(__dirname, '../../images');
    const images = fs.readdirSync(imagesDirPath);
    const names = [];
    images.forEach((filename) => {
      if (path.extname(filename) == '.png') {
        names.push(path.basename(filename, '.png'));
      }
    });
    // console.log(names)
    if (!(await this.check_images(z, names))) {
      this.upload_images(z, imagesDirPath, names);
    }

    return this.find_images_by_names(z, names);
  }

  async check_images(z, names) {
    const result = await this.find_images_by_names(z, names);

    return result.length == names.length;
  }

  async find_images_by_names(z, imageNames) {
    const params = {
      filter: { name: imageNames },
      imagetype: '1', // 1 - icon, 2 - background
    };
    return await z.image.get(params);
  }

  upload_images(z, imagesDirPath, imageNames) {
    l.info(
      `${this.constructor.name}.upload_images(${imagesDirPath}, ${imageNames})`
    );
    imageNames.forEach(async (imageName) => {
      await this.upload_one_image(z, imagesDirPath, imageName);
    });
  }

  async upload_one_image(z, imageDirPath, imageName) {
    l.info(`${this.constructor.name}.upload_one_image(${imageName})`);
    const image = fs.readFileSync(
      path.resolve(imageDirPath, imageName + '.png'),
      { encoding: 'base64' }
    );
    const params = {
      imagetype: 1, // 1 - icon, 2 - background
      name: imageName,
      image: image,
    };

    return z.image.create(params);
  }
}

export default new ZabbixService();
