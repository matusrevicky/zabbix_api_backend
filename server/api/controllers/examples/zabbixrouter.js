import * as express from 'express';
import zabbixControler from './zabbixcontroller';

export default express
  .Router()
  .get('/login', zabbixControler.login)
  .get('/logout', zabbixControler.logout)
  .get('/hosts', zabbixControler.get_hosts)
  .post('/map', zabbixControler.create_map)
  .post('/triggers', zabbixControler.get_triggers)
  .get('/prepare_images', zabbixControler.prepare_images) //for testing
