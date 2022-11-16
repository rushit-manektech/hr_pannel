const router = require("express").Router(),
  authentication = require("../google"),
  { randomUUID } = require("crypto"),
  moment = require("moment"),
  path = require("path");

router.get("/", async (req, res, next) => {
  try {
    const { calendar } = await authentication();
    const response = await calendar?.events?.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      timeMax: moment().endOf("day").toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.render("index.ejs", {
      title: "ManekTech Schedule Interview",
      success_message: req.flash("success"),
      error_message: req.flash("error"),
      events: response?.data?.items,
    });
  } catch (error) {
    return res.send(error?.message);
  }
});

router.post("/createEvent", async (req, res, next) => {
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

    const file = req.files.resume;
    await file.mv(path.join(__dirname, "../resumes", file.name));

    const { auth, calendar } = await authentication();
    const event = {
      summary: `Manektech interview - ${candidate_name}`,
      description: `<div style="color:red">Hello <b>${candidate_name}</b>,
      \n\nYour interview is scheduled to <b>${
        platform_type === "skype" ? "Skype" : "Google Meet"
      }</b> with <b>Manektech</b>.
      \n\nBelow are points you need to make sure of during the interview:
      \n1. You are attending a call from a Desktop/Laptop and a quiet place.
      \n2. You have a working webcam.
      \n3. You are having stable internet connection.
      \n\n<b>${
        platform_type === "skype"
          ? "Candidate SkypeId: " + candidate_skype_id
          : ""
      }</b>\n</div>`,
      start: { dateTime: new Date(event_date).toISOString() },
      end: {
        dateTime: moment(event_date).add(60, "minutes").toISOString(),
      },
      attendees: [
        {
          displayName: `Interviewer: ${interviewer_name}`,
          email: interviewer_email,
        },
        { displayName: `Candidate: ${candidate_name}`, email: candidate_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: "email",
            minutes: moment(event_date).diff(moment(new Date()), "minutes"),
          },
          {
            method: "popup",
            minutes: moment(event_date).diff(moment(new Date()), "minutes"),
          },
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    const eventWithConferenceData = {
      ...event,
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };
    const result = await calendar?.events?.insert({
      auth: auth,
      calendarId: "primary",
      resource: platform_type === "skype" ? event : eventWithConferenceData,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      sendNotifications: true,
    });
    req.flash("success", "Interview Schedule successfully.");
  } catch (err) {
    req.flash("error", err?.message);
  } finally {
    res.redirect("/");
  }
});

module.exports = router;
