module.exports = {
  currentISODate: new Date().toISOString(),
  endTime: (date) => {
    let newDate = date ? new Date(date) : new Date();
    newDate.setHours(newDate.getHours() + 1);
    return newDate.toISOString();
  },
  dateISOFormate: (date) => {
    let ISODate = date ? new Date(date) : new Date();
    // decrease the Asia/Kolkatta time +5:30
    ISODate.setHours(ISODate.getHours() - 5);
    ISODate.setMinutes(ISODate.getMinutes() - 30);
    return ISODate.toISOString();
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
