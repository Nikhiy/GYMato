import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAppData } from "../context/AppContext"

const ProtectedRoute=()=>{
    const {isAuth,user,loading}=useAppData()
    const location=useLocation()
    if(loading) return null
    if(!isAuth){
        return <Navigate to={'/login'} replace/>;
    }
    if(user?.role === null && location.pathname!=="/select-role"){
        return <Navigate to ={'/select-role'} replace/>;
    }

    // if(user?.role !== null && location.pathname==="/select-role"){
    //     return <Navigate to ={'/'} replace/>;
    // }

    //=================
    //this below part is chatgpt version and above one is mine
    //=================

    // 3. User exists but role not selected
    // if (user && user.role === null) {
    //     if (location.pathname !== "/select-role") {
    //     return <Navigate to="/select-role" replace />;
    //     }
    // }

    // // 4. Role already selected but user on select-role page
    // if (user && user.role !== null && location.pathname === "/select-role") {
    //     return <Navigate to="/" replace />;
    // }

    return <Outlet/>
};


export default ProtectedRoute;