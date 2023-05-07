//jshint esversion:6

module.exports.getDate = function () {
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  const today = new Date();

  return today.toLocaleDateString("en-US", options);
};

module.exports.getDay = function () {
  const options = {
    weekday: "long",
  };

  const today = new Date();

  return today.toLocaleDateString("en-US", options);
};
