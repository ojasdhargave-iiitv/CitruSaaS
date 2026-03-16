import express from "express"
import axios from "axios"


const router = express.Router()

router.get("/login", (req, res) => {

  const authUrl =
    "https://github.com/login/oauth/authorize?" +
    new URLSearchParams({
      client_id: process.env.CLIENT_ID!,
      redirect_uri: process.env.REDIRECT_URI!,
      scope: "user"
    })

  res.redirect(authUrl)
})


router.get("/callback", async (req, res) => {

  const code = req.query.code

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code
    },
    {
      headers: {
        Accept: "application/json"
      }
    }
  )

  const accessToken = tokenResponse.data.access_token

  const user = await axios.get(
    "https://api.github.com/user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  res.json(user.data)
})

export default router