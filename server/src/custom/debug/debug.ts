export class Debug {
    public static devLog(func: string, message: string) {
        console.log("[" + func + "]: " + message);
    }
}