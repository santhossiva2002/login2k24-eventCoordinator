const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const Event = require('./models/Event'); // Ensure correct path
const Winner = require('./models/winnerSchema'); // Ensure correct path
// Import the User model
const User = require('./models/UserRegister'); // Adjust the path if necessary



const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect('mongodb+srv://skavin1701:PD5B64hvcg9SfptL@cluster0.thhqsol.mongodb.net/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true if using HTTPS
  })
);

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Event name to collection name mapping
const eventCollectionMapping = {
  AlgoCode: 'AlgoCode',
  codesprint: 'CODESPRINT',
  crickbid: 'CrickBidAuction',
  techiadz: 'Techiadz',
  datathon: 'Datathon',
  mathpirates: 'MathPirates',
  nethunt: 'NetHunt',
  tripletrouble: 'TripleTrouble',
  wittymindz: 'WittyMindz',
  pictureperfect: 'PicturePerfect',
  thinklytics: 'Thinklytics',
  laststandracing: 'LastStandRacing',
  laststandvalorant: 'LastStandValorant',
};

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
    const { name, pwd } = req.body;
    try {
      const event = await Event.findOne({ name, pwd });
  
      if (event) {
        req.session.name = name; // Store event name in session
  
        if (name === 'staroflogin') {
          // Redirect 'staroflogin' user to the all-winners page
          res.redirect('/all-winners');
        } else if(name === 'acc') {
          // Redirect other users to the events page
          res.redirect('/accommodation');
        }
        else if(name === 'admin') {
            // Redirect other users to the events page
            res.redirect('/admin-dash');
          }
        else{
            res.redirect('/events');
        }
      } else {
        res.status(401).render('login', { error: 'Invalid event name or password' });
      }
    } catch (error) {
      res.status(500).render('login', { error: 'Error logging in' });
    }
  });
  

// app.get('/events', async (req, res) => {
//   if (!req.session.name) {
//     return res.redirect('/');
//   }
//   try {
//     const collectionName = eventCollectionMapping[req.session.name];

//     if (!collectionName) {
//       return res.status(404).render('event', { error: 'Event not found', teams: [] });
//     }

//     const collection = mongoose.connection.collection(collectionName);

//     // Fetch event team details
//     const teams = await collection.find({}).toArray();

//     res.render('event', { name: req.session.name, teams });
//   } catch (error) {
//     console.error('Error fetching event details:', error);
//     res.status(500).render('event', { error: 'Error fetching event details', teams: [] });
//   }
// });

app.get('/events', async (req, res) => {
    if (!req.session.name) {
      return res.redirect('/');
    }
    try {
      const collectionName = eventCollectionMapping[req.session.name];
  
      if (!collectionName) {
        return res.status(404).render('event', { error: 'Event not found', teams: [] });
      }
  
      const collection = mongoose.connection.collection(collectionName);
  
      // Fetch event team details
      const teams = await collection.find({}).toArray();
  
      // Fetch additional details for each team member based on their email
      for (const team of teams) {
        team.membersDetails = await Promise.all(
          team.emails.map(async (email) => {
            return await User.findOne({ email }).select('stream degree yearOfStudy contactNumber email');
          })
        );
      }
  
      res.render('event', { name: req.session.name, teams });
    } catch (error) {
      console.error('Error fetching event details:', error);
      res.status(500).render('event', { error: 'Error fetching event details', teams: [] });
    }
  });
  
// app.get('/winner', async (req, res) => {
//   if (!req.session.name) {
//     return res.redirect('/');
//   }
//   try {
//     const collectionName = eventCollectionMapping[req.session.name];

//     if (!collectionName) {
//       return res.status(404).render('winner', { error: 'Event not found', teams: [], winners: [] });
//     }

//     // Fetch all teams
//     const collection = mongoose.connection.collection(collectionName);
//     const teams = await collection.find({}).toArray();
//     console.log('Teams fetched:', teams);

//     // Fetch current winners
//     const winners = await Winner.find({ eventName: req.session.name });
//     console.log('Winners fetched:', winners);

//     // Render the winner page with teams and winners
//     res.render('winner', { teams, winners });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).render('winner', { error: 'Error loading winner data', teams: [], winners: [] });
//   }
// });

app.get('/winner', async (req, res) => {
    if (!req.session.name) {
      return res.redirect('/');
    }
    try {
      const collectionName = eventCollectionMapping[req.session.name];
  
      if (!collectionName) {
        return res.status(404).render('winner', { error: 'Event not found', teams: [], winners: [], showSelection: false });
      }
  
      // Fetch all teams
      const collection = mongoose.connection.collection(collectionName);
      const teams = await collection.find({}).toArray();
      console.log('Teams fetched:', teams);
  
      // Fetch current winners for the specific event
      const winners = await Winner.find({ eventName: req.session.name });
      console.log('Winners fetched:', winners);
  
      // Check if the winner already exists for this event
      const showSelection = winners.length === 0;
  
      // Render the winner page with teams, winners, and the display condition
      res.render('winner', { teams, winners, showSelection });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).render('winner', { error: 'Error loading winner data', teams: [], winners: [], showSelection: false });
    }
  });
  
// Route to handle saving winners and runner-ups
app.post('/winner', async (req, res) => {
  const { winner, runnerUp } = req.body;

  try {
    const collectionName = eventCollectionMapping[req.session.name];
    const collection = mongoose.connection.collection(collectionName);

    // Fetch details of winner and runner-up teams
    const winnerDetails = await collection.findOne({ teamId: winner });
    const runnerUpDetails = await collection.findOne({ teamId: runnerUp });

    if (!winnerDetails || !runnerUpDetails) {
      // Fetch teams and winners again to render the page with proper data
      const teams = await collection.find({}).toArray();
      const winners = await Winner.find({ eventName: req.session.name });

      // Render the page with error message and necessary data
      return res.status(400).render('winner', {
        error: 'Invalid team selection',
        teams,
        winners,
      });
    }

    // Save the winner record in the Winner collection
    const newWinner = new Winner({
      eventName: req.session.name, // Event name from session
      winnerTeamId: winner,
      winnerParticipants: winnerDetails.studentName,
      runnerUpTeamId: runnerUp,
      runnerUpParticipants: runnerUpDetails.studentName,
    });

    await newWinner.save();

    // Refresh the winner page to display updated results
    res.redirect('/winner');
  } catch (error) {
    console.error('Error saving winner data:', error);

    // Fetch teams and winners again in case of an error
    const collectionName = eventCollectionMapping[req.session.name];
    const collection = mongoose.connection.collection(collectionName);
    const teams = await collection.find({}).toArray();
    const winners = await Winner.find({ eventName: req.session.name });

    // Render the page with the error message and necessary data
    res.status(500).render('winner', {
      error: 'Error saving winner data',
      teams,
      winners,
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('event', { error: 'Error logging out' });
    }
    res.redirect('/');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Route to display all winners
app.get('/all-winners',checkStarOfLogin, async (req, res) => {
    if (!req.session.name) {
      return res.redirect('/');
    }
  
    try {
      // Fetch all winners from the Winner collection
      const winners = await Winner.find({});
      console.log('All winners fetched:', winners);
  
      // Render the winners page with the data
      res.render('allWinners', { winners });
    } catch (error) {
      console.error('Error fetching winners:', error);
      res.status(500).render('allWinners', { error: 'Error loading winners data', winners: [] });
    }
  });
  // Middleware to check if the user is logged in as 'staroflogin'
function checkStarOfLogin(req, res, next) {
    if (req.session.name === 'staroflogin') {
      next(); // Proceed to the route handler
    } else {
      res.redirect('/'); // Redirect to the home page or another appropriate route
    }
  }
  // Middleware to check if the user is logged in as 'acc'
function checkAcc(req, res, next) {
    if (req.session.name === 'acc') {
      next(); // Proceed to the route handler
    } else {
      res.redirect('/'); // Redirect to the home page or another appropriate route
    }
}

app.get('/accommodation', checkAcc, async (req, res) => {
    try {
        // Fetch users with accommodation set to 'Yes'
        const usersWithAccommodation = await User.find({ accommodation: 'Yes' });
        
        res.render('accommodation', { users: usersWithAccommodation });
    } catch (error) {
        console.error('Error fetching users with accommodation:', error);
        res.status(500).render('accommodation', { users: [], error: 'Error fetching users with accommodation' });
    }
});

// app.post('/accommodation/save', async (req, res) => {
//     const selectedUserIds = req.body.selectedUsers;
  
//     if (!selectedUserIds || !Array.isArray(selectedUserIds)) {
//       return res.status(400).send('No users selected');
//     }
  
//     try {
//       // Delete selected users from the Accommodation collection
//       await Accommodation.deleteMany({ _id: { $in: selectedUserIds } });
  
//       // Optionally, fetch updated data and render the accommodation page
//       const usersWithAccommodation = await User.find({ accommodation: 'Yes' });
  
//       res.render('accommodation', { users: usersWithAccommodation, success: 'Selected users have been deleted.' });
//     } catch (error) {
//       console.error('Error deleting selected users:', error);
//       res.status(500).render('accommodation', { users: [], error: 'Error deleting selected users' });
//     }
//   });
  
function checkAdmin(req, res, next) {
    if (req.session.name === 'admin') {
      next(); // Proceed to the route handler
    } else {
      res.redirect('/'); // Redirect to the home page or another appropriate route
    }
  }
  app.get('/admin-dash', checkAdmin, async (req, res) => {
    try {
      const eventDetails = [];
      const events = await Event.find({});
  
      for (const event of events) {
        const collectionName = eventCollectionMapping[event.name];
        if (collectionName) {
          const collection = mongoose.connection.collection(collectionName);
  
          // Fetch all registered teams for the event
          const teams = await collection.find({}).toArray();
  
          // Fetch details of team members
          for (const team of teams) {
            team.membersDetails = await Promise.all(
              team.emails.map(async (email) => {
                return await User.findOne({ email }).select('name department contactNumber email');
              })
            );
          }
  
          // Fetch winners for the event
          const winners = await Winner.find({ eventName: event.name });
  
          eventDetails.push({
            eventName: event.name,
            teams,
            winners
          });
        }
      }
  
      // Render the admin dashboard page with all event details
      res.render('adminDashboard', { eventDetails });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      res.status(500).render('adminDashboard', { error: 'Error loading admin dashboard data', eventDetails: [] });
    }
  });
  
//   app.get('/admin-dash', checkAdmin, async (req, res) => {
//     try {
//       const eventDetails = [];
  
//       // Fetch event names from the Event collection
//       const events = await Event.find({});
  
//       for (const event of events) {
//         const collectionName = eventCollectionMapping[event.name];
//         if (collectionName) {
//           const collection = mongoose.connection.collection(collectionName);
  
//           // Fetch all registered teams for the event
//           const teams = await collection.find({}).toArray();
  
//           // Fetch winners for the event
//           const winners = await Winner.find({ eventName: event.name });
  
//           // Map `studentName` to `members`
//           const teamsWithMembers = teams.map(team => ({
//             ...team,
//             members: team.studentName || []  // Map studentName to members
//           }));
  
//           eventDetails.push({
//             eventName: event.name,
//             teams: teamsWithMembers,
//             winners
//           });
//         }
//       }
  
//       // Render the admin dashboard page with all event details
//       res.render('adminDashboard', { eventDetails });
//     } catch (error) {
//       console.error('Error fetching admin dashboard data:', error);
//       res.status(500).render('adminDashboard', { error: 'Error loading admin dashboard data', eventDetails: [] });
//     }
//   });
  