import l from '../../common/logger';
import fs from 'fs';
import path from 'path';

var zabbixes = require("./object-zabbixes");


class ZabbixService {
  async login(req) {
    l.info(`${this.constructor.name}.login()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    var z = zabbixes[req.session.id];
    return z.user.check();
  }

  logout(req) {
    l.info(`${this.constructor.name}.logout()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    var z = zabbixes[req.session.id];
    return z.user.logout();
  }

  get_host_groups(req) {
    l.info(`${this.constructor.name}.get_host_groups()`);
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    var z = zabbixes[req.session.id];
    return z.host.group.get();
  }

  get_hosts(req) {
    l.info(`${this.constructor.name}.get_hosts()`);
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    var z = zabbixes[req.session.id];
    const groupids = req.body.groupids;
    const params = {
      "groupids": groupids
    };
    return z.host.get(params);
  }

  async create_maps(req) {
    l.info(`${this.constructor.name}.create_maps()`);
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    var z = zabbixes[req.session.id];

    const hostids = req.body.hostids;
    const results = hostids.map(async (hostid) => {
      return this.create_map(z, hostid);
    });

    return Promise.all(results);
  }

  async create_map(z, hostid) {
    const triggers = await this.get_triggers_by_hostid(z, hostid);
    const mapSize = this.compute_map_size(triggers.length, 50);
    const images = await this.prepare_images(z);
    const map = this.create_map_params(hostid, triggers, mapSize, images, 50);
    return z.map.create(map);
  }

  create_map_params(hostid, triggers, mapSize, images, gap){
    const selements = this.create_selements(triggers, images, gap);
    const params = {
      "name": hostid + ' trigger MAP',
      "width": mapSize[0],
      "height": mapSize[1],
      "selements": selements
    }
    return params;
  }

  create_selements(triggers, images, gap) {
    let x = 0;
    let y = 100;
    let label_location = 3;
    let iconOff = '01-Port-Up';
    let iconDisabled = '01-Port-Disabled';
    let iconMaintenance = '01-Port-Warning';
    let iconOn = '01-Port-Down';
    
    const selements =  triggers.map((trigger, index) => {
      x = gap*(index+1);
      if (index > (triggers.length-1)/2){
        x -= (triggers.length/2)*gap;
        y = 150;
        label_location = 0;
        iconOff = '02-Port-Up';
        iconDisabled = '02-Port-Disabled';
        iconMaintenance = '02-Port-Warning';
        iconOn = '02-Port-Down';
      }
      const element = {
        "elements": [
          {"triggerid": trigger.triggerid}
        ],
        "label_location": label_location,
        "elementtype": 2,
        "iconid_off": images.find(image => image.name == iconOff).imageid,
        "iconid_disabled": images.find(image => image.name == iconDisabled).imageid,
        "iconid_maintenance": images.find(image => image.name == iconMaintenance).imageid,
        "iconid_on": images.find(image => image.name == iconOn).imageid,
        "x": x,
        "y": y
      }
      return element;
    });

    return selements;
  }

  compute_map_size(triggers_count, gap) {
    const width = ((triggers_count/2) + 1) * gap;
    return [width, 300];
  }

  get_triggers_by_hostid(z, hostid){
    const params = {
      "filter": {
        "hostid": hostid
      }
    }
    return z.trigger.get(params);;
  }

  async prepare_images(z) {
    l.info(`${this.constructor.name}.prepare_images()`);
    const imagesDirPath = path.resolve(__dirname, '../../images');
    const images = fs.readdirSync(imagesDirPath);
    const imageNames = images.map((filename) => {return path.basename(filename, '.png')});

    if(!await this.check_images(z, imageNames)){
      this.upload_images(z, imagesDirPath, imageNames)
    }

    return this.find_images_by_names(z, imageNames);
  }

  async check_images(z, imageNames) {
    const result = await this.find_images_by_names(z, imageNames);
    
    return result.length == imageNames.length;
  }

  async find_images_by_names(z, imageNames) {
    const params = {
      "filter": {"name": imageNames},
      "imagetype": "1" // 1 - icon, 2 - background
    };
    return await z.image.get(params);
  }

  upload_images(z, imagesDirPath, imageNames) {
    l.info(`${this.constructor.name}.upload_images(${imagesDirPath}, ${imageNames})`);
    imageNames.forEach(async imageName => {
      await this.upload_one_image(z, imagesDirPath, imageName);
    });
  }

  async upload_one_image(z, imageDirPath, imageName) {
    l.info(`${this.constructor.name}.upload_one_image(${imageName})`);
    const image = fs.readFileSync(path.resolve(imageDirPath, imageName + '.png'), {encoding: 'base64'});
    const params = {
      "imagetype": 1, // 1 - icon, 2 - background
      "name": imageName,
      "image": image
    }

    return z.image.create(params);
  }

}

export default new ZabbixService();
