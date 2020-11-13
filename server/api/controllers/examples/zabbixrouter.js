import * as express from 'express';
import zabbixControler from './zabbixcontroller';

export default express
  .Router()
  .post('/login', zabbixControler.login)
  .get('/logout', zabbixControler.logout)
  .get('/host_groups', zabbixControler.get_host_groups)
  .post('/hosts', zabbixControler.get_hosts)
  .post('/maps', zabbixControler.create_maps)
