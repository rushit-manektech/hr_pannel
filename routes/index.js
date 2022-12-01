const router = require('express').Router(),
  authentication = require('../google'),
  { randomUUID } = require('crypto'),
  moment = require('moment'),
  path = require('path');

router.get('/', async (req, res, next) => {
  try {
    const { calendar } = await authentication();
    const response = await calendar?.events?.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      timeMax: moment().endOf('day').toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.render('index.ejs', {
      title: 'ManekTech Schedule Interview',
      success_message: req.flash('success'),
      error_message: req.flash('error'),
      events: response?.data?.items,
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

    // const file = req.files.resume;
    // const fileName = file.name.replace(/ +/g, '');
    // await file.mv(path.join(__dirname, '../resumes', fileName));

    const { auth, calendar } = await authentication();
    const event = {
      summary: `Manektech interview - ${candidate_name}`,
      description: `Dear <b>${candidate_name}</b>,

      Hope you are doing well. Blocking your calendar for a round of Interview.

      Kindly go through the details and share your acceptance.

      Joining link is given. <b>${
        platform_type === 'skype' ? `Candidate SkypeId: ${candidate_skype_id}` : ''
      }</b> Hope the timing works for you.

      Before start the interview, please make sure below points:<ul><li>You are attending a call from a Desktop/Laptop and a quiet place.</li><li>You have a working webcam.</li><li>You are having stable internet connection.</li></ul>
      `,
      // Resume: <a href="${req.protocol}://${req.get('host')}/resumes/${fileName}" target="_blank"> Resume URL </a>
      start: { dateTime: new Date(event_date).toISOString() },
      end: { dateTime: moment(event_date).add(60, 'minutes').toISOString() },
      attendees: [
        { displayName: `Interviewer: ${interviewer_name}`, email: interviewer_email },
        { displayName: `Candidate: ${candidate_name}`, email: candidate_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: moment(event_date).diff(moment(new Date()), 'minutes') },
          { method: 'popup', minutes: moment(event_date).diff(moment(new Date()), 'minutes') },
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
    const result = await calendar?.events?.insert({
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
    res.redirect('/');
  }
});

module.exports = router;
