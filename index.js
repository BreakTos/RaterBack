const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const bodyParser = require('body-parser');
const port = process.env.PORT || 3000; // Use dynamic port or default to 3000

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECT_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define a mongoose schema for votes
const voteSchema = new mongoose.Schema({
  problem: String,
  names: [String]
});

// Create a mongoose model
const Vote = mongoose.model("Vote", voteSchema);

// Handle POST requests at /updateVotes
app.post('/updateVotes', async (req, res) => {
  console.log(req.body);
  try {
    const data = req.body;
    const problem = data.prob;
    const name = data.name;

    console.log(problem, name);

    // Find or create a document for the given problem
    let vote = await Vote.findOne({ problem });

    if (!vote) {
      //console.log("j");
      vote = new Vote({ problem, names: [name] });
      await vote.save();
    } else if (vote.names.includes(name)) {
      return res.status(400).json({ success: false, message: 'Name already exists for the given problem.' });
    } else {
      vote.names.push(name);
      await vote.save();

      res.status(200).json({ success: true, message: 'Vote recorded successfully.' });
    }
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
