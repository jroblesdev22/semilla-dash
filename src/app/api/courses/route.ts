import { auth } from "@/auth"
import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No access token found" }, 
        { status: 401 }
      )
    }

    // Configure OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    // Create Classroom API client
    const classroom = google.classroom({
      version: 'v1',
      auth: oauth2Client
    })

    // Get courses
    const result = await classroom.courses.list({
      pageSize: 50,
    })

    const courses = result.data.courses || []

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: "Failed to fetch courses", courses: [] },
      { status: 500 }
    )
  }
}