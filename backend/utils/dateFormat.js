function toMysql(d) {
  return d.toISOString().slice(0, 23).replace('T', ' ');  // "YYYY-MM-DD HH:MM:SS.mmm"
}

export default toMysql;