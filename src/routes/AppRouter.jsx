import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "../cle/auth/LoginPage.jsx";
import {ForwarderDashboard} from "../cle/forwarding/dashboard/ForwarderDashboard.jsx";
import {AddROTForm} from "../cle/forwarding/ROT/AddROTForm.jsx";
import {AddROTForm2} from "../cle/forwarding/ROT/AddROTForm2.jsx";
import {ROTHistory} from "../cle/forwarding/ROTHistory/ROTHistory.jsx";
import {ViewROTDetails} from "../cle/forwarding/ROTHistory/ViewROTDetails.jsx";
import {EditROTForm} from "../cle/forwarding/ROT/EditROT1.jsx";
import {EditROTForm2} from "../cle/forwarding/ROT/EditROT2.jsx";
import {ViewROTPDF} from "../cle/forwarding/ROTHistory/ViewROTPDF.jsx";
import {TrackROT} from "../cle/forwarding/TrackROT/TrackROT.jsx";
import {ViewROTDocument} from "../cle/forwarding/Document/ViewROTDocument.jsx";
import {ForwardingProfile} from "../cle/forwarding/profile/ForwardingProfile.jsx";
import {ForwardingEditProfile} from "../cle/forwarding/profile/ForwardingEditProfile.jsx";
import {ForwardingDashboard} from "../ale/forwarding/ForwardingDashboard.jsx";
import {HaulierDashboard} from "../cle/haulier/dashboard/HaulierDashboard.jsx";
import {YourBookings} from "../cle/haulier/booking/YourBookings.jsx";
import {AcceptedBookings} from "../cle/haulier/booking/AcceptedBookings.jsx";
import {ViewBookings} from "../cle/haulier/booking/ViewBookings.jsx";
import {AssignBooking} from "../cle/haulier/booking/AssignBooking.jsx";
import {HaulierManagement} from "../cle/haulier/management/HaulierManagement.jsx";
import {DriverManagement} from "../cle/haulier/management/DriverManagement.jsx";
import {AddDriver} from "../cle/haulier/management/AddDriver.jsx";
import {PrimeMoverManagement} from "../cle/haulier/management/PrimeMoverManagement.jsx";
import {TrailerManagement} from "../cle/haulier/management/TrailerManagement.jsx";
import {AddPrimeMover} from "../cle/haulier/management/AddPrimeMover.jsx";
import {AddTrailer} from "../cle/haulier/management/AddTrailer.jsx";
import {TerminalDashboard} from "../ale/terminal/TerminalDashboard.jsx";
import {CustomsDashboard} from "../ale/customs/CustomsDashboard.jsx";
import {AKPSDashboard} from "../ale/akps/AKPSDashboard.jsx";
import {EditAssignBooking} from "../cle/haulier/booking/EditAssignBooking.jsx";
import {ViewECsnPDF} from "../cle/haulier/booking/ViewBookingPDF.jsx";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />}/>

                {/* Forwarder Routes */}
                <Route
                    path="/forwarding/dashboard"
                    element={
                        <ProtectedRoute>
                            <ForwarderDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/add/form1"
                    element={
                        <ProtectedRoute>
                            <AddROTForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/add/form2"
                    element={
                        <ProtectedRoute>
                            <AddROTForm2 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/history"
                    element={
                        <ProtectedRoute>
                            <ROTHistory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/view/:id"
                    element={
                        <ProtectedRoute>
                            <ViewROTDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/edit/form1/:id"
                    element={
                        <ProtectedRoute>
                            <EditROTForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/edit/form2/:id"
                    element={
                        <ProtectedRoute>
                            <EditROTForm2 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/view/pdf/:id"
                    element={
                        <ProtectedRoute>
                            <ViewROTPDF />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/track"
                    element={
                        <ProtectedRoute>
                            <TrackROT />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/rot/document/view"
                    element={
                        <ProtectedRoute>
                            <ViewROTDocument />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/profile"
                    element={
                        <ProtectedRoute>
                            <ForwardingProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/forwarding/profile/edit"
                    element={
                        <ProtectedRoute>
                            <ForwardingEditProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/dashboard"
                    element={
                        <ProtectedRoute>
                            <HaulierDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/booking"
                    element={
                        <ProtectedRoute>
                            <YourBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/booking/view/:id"
                    element={
                        <ProtectedRoute>
                            <ViewBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/booking/assign/:id"
                    element={
                        <ProtectedRoute>
                            <AssignBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/booking/accepted"
                    element={
                        <ProtectedRoute>
                            <AcceptedBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/booking/accepted/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditAssignBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/booking/view/eCSN/:id"
                    element={
                        <ProtectedRoute>
                            <ViewECsnPDF />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/management/configure"
                    element={
                        <ProtectedRoute>
                            <HaulierManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/manage/drivers"
                    element={
                        <ProtectedRoute>
                            <DriverManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/add/driver"
                    element={
                        <ProtectedRoute>
                            <AddDriver />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/manage/prime-movers"
                    element={
                        <ProtectedRoute>
                            <PrimeMoverManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/add/prime-mover"
                    element={
                        <ProtectedRoute>
                            <AddPrimeMover />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/manage/trailers"
                    element={
                        <ProtectedRoute>
                            <TrailerManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/haulier/add/trailer"
                    element={
                        <ProtectedRoute>
                            <AddTrailer />
                        </ProtectedRoute>
                    }
                />

                {/* ALE */}
                <Route
                    path="/ale/forwarding/dashboard"
                    element={
                        <ProtectedRoute>
                            <ForwardingDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/terminal/dashboard"
                    element={
                        <ProtectedRoute>
                            <TerminalDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/customs/dashboard"
                    element={
                        <ProtectedRoute>
                            <CustomsDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/akps/dashboard"
                    element={
                        <ProtectedRoute>
                            <AKPSDashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Fallback */}
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    )
}