import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";

const createAccessToken = async (userInfo, grant) => {
    const accessToken = new AccessToken(
        process.env.LIVEKIT_API_KEY || "",
        process.env.LIVEKIT_API_SECRET || "",
        userInfo
    );

    accessToken.addGrant(grant);
    return accessToken.toJwt();
};   

export const generateToken = async (req, res) => {
    try {
        const userId = req.query.userId || uuidv4();
        const roomName = uuidv4(); // generate unique one
        
        const roomClient = new RoomServiceClient(
            process.env.LIVEKIT_URL || "",
            process.env.LIVEKIT_API_KEY || "",
            process.env.LIVEKIT_API_SECRET || ""
        );

        // Create or get room
        try {
            await roomClient.createRoom({
                name: roomName
            });
        } catch (error) {
            // Room might already exist, that's okay
            console.log(`Room ${roomName} might already exist`);
        }

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

        return res.status(200).json({ 
            token, 
            room: roomName,
            url: process.env.LIVEKIT_URL
        });
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Failed to generate token" });
    }
};

