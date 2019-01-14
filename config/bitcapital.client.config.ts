import Bitcapital, { User as BitcapitalUser, Session, StorageUtil, MemoryStorage } from "bitcapital-core-sdk";
import { User } from "../api/models"
import { OAuthPasswordRequest } from "bitcapital-core-sdk/dist/types/services/request";

const credentials = {
    baseURL: 'https://testnet.btcore.app',
    clientId: 'exchange-sample',
    clientSecret: 'a5688da8-bf4b-4559-bca3-ed3ce676cb8a',
}

const session = new Session({
    storage: new StorageUtil("session", new MemoryStorage()),
    http: credentials,
    oauth: credentials
});

let bitcapitalClient: Bitcapital;

async function initialize() {
    bitcapitalClient = Bitcapital.initialize({ session, ...credentials });
    await bitcapitalClient.session().clientCredentials();
}

export async function getBitcapitalAPIClient() {
    if (!bitcapitalClient) {
        await initialize();
    }

    return bitcapitalClient;
}

export async function authenticateUser(user: User): Promise<User> {
    const client = await getBitcapitalAPIClient();
    const remoteUser: BitcapitalUser = await client.session().password({
        username: user.email,
        password: 'user.password'
    });

    return new User({
        bitcapital_id: remoteUser.id,
        bitcapital_token: remoteUser.credentials.accessToken
    });
}