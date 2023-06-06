import { useEffect } from "react";
import { useSelector } from "react-redux";
import { MenuComponent } from "../components/Menu";

export function DashboardPage() {
    const username = useSelector((state) => state.username);
    const accessToken = useSelector((state) => state.accessToken);
    useEffect(() => {
        console.log(accessToken);
    });
    return (
        <>
            <MenuComponent />
        </>
    );
}
