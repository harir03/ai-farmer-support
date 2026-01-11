import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const createAccessToken = async (userInfo: { identity: string, name?: string }, grant: any) => {
    const accessToken = new AccessToken(
        process.env.LIVEKIT_API_KEY || "",
        process.env.LIVEKIT_API_SECRET || "",
        userInfo
    );

    accessToken.addGrant(grant);
    return accessToken.toJwt();
};

export async function GET(req: NextRequest) {
    try {
        const userId = new URL(req.url).searchParams.get("userId") || uuidv4();
        const roomName = uuidv4(); // Generate a unique room name for each request

        const roomClient = new RoomServiceClient(
            process.env.LIVEKIT_URL || "https://livekit.example.com",
            process.env.LIVEKIT_API_KEY || "",
            process.env.LIVEKIT_API_SECRET || ""
        );

        await roomClient.createRoom({
            name: roomName
        });

        const grant = {
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canPublishData: true,
            canSubscribe: true,
            canUpdateOwnMetadata: true,
        }

        const token = await createAccessToken(
            { identity: userId, name: userId },
            grant
        );

        return NextResponse.json({ token, room: roomName, }, { status: 200 });
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
    }
}