/**
 * @returns {Record<string, { connectionOptions: (import('@forestadmin/datasource-sql').ConnectionOptions | import('@forestadmin/datasource-mongo').ConnectionParams); datasourceSuffix?: string; }>}
 */
module.exports = () => ({
  main: {
    connectionOptions: {
      // uri: "postgres://antikode@localhost:5432/sonarpay",
      uri: "postgresql://postgres.tjapmbkozozdolranijt:n4o4V77Pb4OtEQ4b@aws-1-eu-west-3.pooler.supabase.com:5432/postgres",
    },
  },
});
