module.exports = {
  currentISODate: new Date().toISOString(),
  endTime: (date) => {
    let newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 1);
    return newDate.toISOString();
  },
  dateDifference: (formate = 'minutes', date1 = new Date(), date2 = new Date()) => {
    const diff = Math.abs(new Date(date2) - new Date(date1));
    let date = diff;
    switch (formate) {
      case 'minutes':
        date = Math.floor(diff / 1000 / 60);
        break;
      case 'hours':
        date = Math.floor(diff / 1000 / 60 / 60);
        break;
      case 'days':
        date = Math.floor(diff / 1000 / 60 / 60 / 24);
        break;
      default:
        // miliseconds
        date;
        break;
    }
    return date;
  },
};
