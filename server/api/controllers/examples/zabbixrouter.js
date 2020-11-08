import * as express from 'express';
import zabbixControler from './zabbixcontroller';

export default express
  .Router()
  .post('/login', zabbixControler.login)
  .get('/logout', zabbixControler.logout)
  .get('/hosts', zabbixControler.get_hosts)
  .post('/maps', zabbixControler.create_maps)
