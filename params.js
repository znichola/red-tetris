const params = {
  server: {
    host: "0.0.0.0", // so it's visible from outside the container, localhost will block external connections
    port: 3000,
    get url() {
      return "http://" + this.host + ":" + this.port;
    },
  },
};

export default params;
