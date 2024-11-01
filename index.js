const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7ijeqqy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const projectCollection = client.db("portfolio").collection("projects");
const skillsCollection = client.db("portfolio").collection("skills");
const backendSkillsCollection = client.db("portfolio").collection("backendSkills");
const contactCollection = client.db("portfolio").collection("contacts");
const blogsCollection = client.db("portfolio").collection("blogs");

async function run() {
  try {

    // middleware for token verify______
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'forbidden access' })
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
      })
    }


    app.get("/projects", async (req, res) => {
      try {
        const projects = await projectCollection.find({}).toArray();
        if (projects.length > 0) {
          res.status(200).json(projects);
        } else {
          res.status(404).json({ message: "No projects found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Create / Post Project data into db
    app.post('/projects', async (req, res) => {
      const projectsItem = req.body;
      const result = await projectCollection.insertOne(projectsItem);
      res.send(result)
    })

    app.get("/projects/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const projects = await projectCollection.findOne(query);
        res.send(projects);
      } catch (error) {
        console.error(error);
      }
    });

    app.put("/projects/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const query = { _id: new ObjectId(id) };
        const update = {
          $set: updatedData
        };
        const result = await projectCollection.updateOne(query, update);

        if (result.modifiedCount === 1) {
          res.send({ success: true, message: "Project updated successfully" });
        } else {
          res.send({ success: false, message: "Project not found or no changes made" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Error updating project" });
      }
    });

    app.delete("/projects/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const projects = await projectCollection.deleteOne(query);
        res.send(projects);
      } catch (error) {
        console.error(error);
      }
    });

    // Skills api
    app.get("/skills", async (req, res) => {
      try {
        const skills = await skillsCollection.find({}).toArray();
        res.send(skills);
      } catch (error) {
        console.error(error);
      }
    });

    app.post('/skills', async (req, res) => {
      const skillsItem = req.body;
      const result = await skillsCollection.insertOne(skillsItem);
      res.send(result)
    })
    // create backend skill api
    app.post('/backendskills', async (req, res) => {
      const skillsItem = req.body;
      const result = await backendSkillsCollection.insertMany(skillsItem);
      res.send(result)
    })
    // get backend api to server from db
    app.get("/backendskills", async (req, res) => {
      try {
        const skills = await backendSkillsCollection.find({}).toArray();
        res.send(skills);
      } catch (error) {
        console.error(error);
      }
    });

    app.delete("/skills/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const skill = await skillsCollection.deleteOne(query);
        res.send(skill);
      } catch (error) {
        console.error(error);
      }
    });

    // contact data to db
    app.post('/contacts', async (req, res) => {
      const contactItem = req.body;
      const result = await contactCollection.insertOne(contactItem);
      res.send(result)
    })

    app.get('/contacts',  async (req, res) => {
      const result = await contactCollection.find({}).toArray();
      res.send(result)
    })

    // Create / Post Blogs data into db
    app.post('/blogs', async (req, res) => {
      const blogItem = req.body;
      const result = await blogsCollection.insertOne(blogItem);
      res.send(result)
    })

    app.get('/blogs',  async (req, res) => {
      const result = await blogsCollection.find({}).toArray();
      res.send(result)
    })

    app.get("/blogs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const blogs = await blogsCollection.findOne(query);
        res.send(blogs);
      } catch (error) {
        console.error(error);
      }
    });

    // jwt apiii(create jwt api)
    app.post('/jwt', (req, res) => {
      const userInfo = req.body;
      const token = jwt.sign(userInfo, process.env.TOKEN_SECRET, {
        expiresIn: '1hr'
      })
      console.log("token in jwt", token);
      res.send({ token });
    })

    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// root api

app.get("/", (req, res) => {
  try {
    res.send(`Portfolio server is running on ${port}`);
  } catch (error) {
    res.send("Server is not working");
  }
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
