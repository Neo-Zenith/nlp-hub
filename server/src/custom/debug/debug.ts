export class Debug {
    public static devLog(userID: string, message: string) {
        console.log("[" + userID + "]: " + message);
    }
}