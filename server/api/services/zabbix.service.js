import l from '../../common/logger';
import fs from 'fs';
import path from 'path';

const Zabbix = require('zabbix-rpc');
const z = new Zabbix('127.0.0.1');

class ZabbixService {
  login() {
    l.info(`${this.constructor.name}.login()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    return z.user.login('Admin', 'zabbix').then((r) => z.user.check());
  }

  logout() {
    l.info(`${this.constructor.name}.logout()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    return z.user.logout();
  }

  get_hosts() {
    l.info(`${this.constructor.name}.get_hosts()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    return z.host.get();
  }

  create_map(map) {
    return z.map.create(map);
  }

  get_triggers(query) {
    return z.trigger.get(query);
  }

  async prepare_images() {
    await this.login() // erase later
    l.info(`${this.constructor.name}.prepare_images()`);
    const imagesDirPath = path.resolve(__dirname, '../../images');
    const images = fs.readdirSync(imagesDirPath);
    const imageNames = images.map((filename) => {return path.basename(filename, '.png')});

    if(!await this.check_images(imageNames)){
      this.upload_images(imagesDirPath, imageNames)
    }

    return true;
  }

  async check_images(imageNames) {
    const result = await this.find_images_by_names(imageNames);
    
    return result.length == imageNames.length;
  }

  async find_images_by_names(imageNames) {
    const params = {
      "filter": {"name": imageNames},
      "imagetype": "1" // 1 - icon, 2 - background
    };
    return await z.image.get(params);
  }

  upload_images(imagesDirPath, imageNames) {
    l.info(`${this.constructor.name}.upload_images(${imagesDirPath}, ${imageNames})`);
    imageNames.forEach(async imageName => {
      await this.upload_one_image(imagesDirPath, imageName);
    });
  }

  async upload_one_image(imageDirPath, imageName) {
    l.info(`${this.constructor.name}.upload_one_image(${imageName})`);
    const image = fs.readFileSync(path.resolve(imageDirPath, imageName + '.png'), {encoding: 'base64'});
    const params = {
      "imagetype": 1, // 1 - icon, 2 - background
      "name": imageName,
      "image": image
    }

    return await z.image.create(params);
  }

}

export default new ZabbixService();
