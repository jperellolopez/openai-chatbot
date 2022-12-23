import express from "express";
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from "openai";

dotenv.config()

// get the api key from the .env file
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

// pass the api key into a new instance of openai
const openai = new OpenAIApi(configuration)

// initialize express application
const app = express()

// use cors to allow cross-origin requests and allow server to be called from the frontend
app.use(cors())

// allow to pass json from the frontend
app.use(express.json())

// dummy root route
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from AI Assistant'
    })
})

// allows a route with a body payload
app.post('/', async(req, res) => {
    try {
        const prompt = req.body.prompt
        // pass the parameters into the model as options
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`, // text passed from the user to the bot
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        })

        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error)
        res.status(500).send(error || "Oops... la aplicación ha fallado. Vuelve a recargar la web.")
    }
})

// make sure the server always listens to the requests
app.listen(5000, () => console.log('Server running on port http://localhost:5000'))