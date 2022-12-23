const router = require('express').Router(),
  { randomUUID } = require('crypto'),
  { authentication, refreshToken } = require('../google'),
  { currentISODate, endTime, dateDifference, dateISOFormate } = require('../utils');

router.get('/', async (req, res, next) => {
  try {
    const { calendar } = await authentication();
    const response = await calendar?.events?.list({
      calendarId: 'primary',
      timeMin: currentISODate,
      timeMax: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.render('index.ejs', {
      title: 'ManekTech Schedule Interview',
      success_message: req.flash('success'),
      error_message: req.flash('error'),
      events: response?.data?.items,
      currentISODate,
    });
  } catch (error) {
    return res.send(error?.message);
  }
});

router.post('/createEvent', async (req, res, next) => {
  try {
    const {
      interviewer_name,
      interviewer_email,
      candidate_name,
      candidate_email,
      event_date,
      platform_type,
      interviewer_skype_id,
      candidate_skype_id,
      zoom_id,
      zoom_password,
    } = req.body;

    const { auth, calendar } = await authentication();
    const startDate = dateISOFormate(event_date);
    const dateDiff = dateDifference('minutes', startDate);

    const event = {
      summary: `Manektech interview - ${candidate_name}`,
      description: `Dear <b>${candidate_name}</b>,

      Hope you are doing well. Blocking your calendar for a round of Interview.

      ${platform_type === 'skype' ? `Candidate SkypeId: ${candidate_skype_id}` : ''} 

      Kindly go through the details and share your acceptance.

      Joining link is given. Hope the timing works for you.
      
      Before start the interview, please make sure below points:<ul><li>You are attending a call from a Desktop/Laptop and a quiet place.</li><li>You have a working webcam.</li><li>You are having stable internet connection.</li></ul>`,
      start: { dateTime: startDate },
      end: { dateTime: endTime(startDate) },
      attendees: [
        { displayName: `Interviewer: ${interviewer_name}`, email: interviewer_email },
        { displayName: `Candidate: ${candidate_name}`, email: candidate_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: dateDiff },
          { method: 'popup', minutes: dateDiff },
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const eventWithConferenceData = {
      ...event,
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };
    await calendar?.events?.insert({
      auth: auth,
      calendarId: 'primary',
      resource: platform_type === 'skype' ? event : eventWithConferenceData,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      sendNotifications: true,
    });
    req.flash('success', 'Interview Schedule successfully.');
  } catch (err) {
    req.flash('error', err?.message);
  } finally {
    return res.redirect('/');
  }
});

router.get('/delete/:id', async (req, res, next) => {
  try {
    const { auth, calendar } = await authentication();

    await calendar?.events?.delete({
      auth: auth,
      calendarId: 'primary',
      eventId: req.params.id,
      sendUpdates: 'all',
    });
    req.flash('success', 'Interview canceled successfully.');
  } catch (err) {
    req.flash('error', err?.message);
  } finally {
    return res.redirect('/');
  }
});

router.post('/refresh-token', refreshToken);

module.exports = router;
