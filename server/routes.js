import zabbixRouter from './api/controllers/examples/zabbixrouter';

export default function routes(app) {
  app.use('/api/v1/zabbix', zabbixRouter);
}
