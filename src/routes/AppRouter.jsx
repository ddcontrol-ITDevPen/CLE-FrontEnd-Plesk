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
import {EditAssignBooking} from "../cle/haulier/booking/EditAssignBooking.jsx";
import {ViewECsnPDF} from "../cle/haulier/booking/ViewBookingPDF.jsx";
import {CreateBookingForm} from "../cle/haulier/booking/CreateBookingForm.jsx";
import {EditCreateBooking} from "../cle/haulier/booking/EditCreateBooking.jsx";
import {ALEForwardingDashboard} from "../ale/forwarding/dashboard/ForwardingDashboard.jsx";
import {ALEAddROTForm} from "../ale/forwarding/ROT/AddROTForm.jsx";
import {ALEAddROTForm2} from "../ale/forwarding/ROT/AddROTForm2.jsx";
import {ALEROTHistory} from "../ale/forwarding/ROTHistory/ROTHistory.jsx";
import {ALEViewROTDetails} from "../ale/forwarding/ROTHistory/ViewROTDetails.jsx";
import {ALEEditROTForm} from "../ale/forwarding/ROT/EditROT1.jsx";
import {ALEEditROTForm2} from "../ale/forwarding/ROT/EditROT2.jsx";
import {ALEViewROTPDF} from "../ale/forwarding/ROTHistory/ViewROTPDF.jsx";
import {ALETrackROT} from "../ale/forwarding/TrackROT/TrackROT.jsx";
import {ALEViewROTDocument} from "../ale/forwarding/Document/ViewROTDocument.jsx";
import {ALEForwardingProfile} from "../ale/forwarding/profile/ForwardingProfile.jsx";
import {ALEForwardingEditProfile} from "../ale/forwarding/profile/ForwardingEditProfile.jsx";
import {ALEHaulierDashboard} from "../ale/haulier/dashboard/HaulierDashboard.jsx";
import {ALEYourBookings} from "../ale/haulier/booking/YourBookings.jsx";
import {ALEAcceptedBookings} from "../ale/haulier/booking/AcceptedBookings.jsx";
import {ALEViewBookings} from "../ale/haulier/booking/ViewBookings.jsx";
import {ALEAssignBooking} from "../ale/haulier/booking/AssignBooking.jsx";
import {ALEHaulierManagement} from "../ale/haulier/management/HaulierManagement.jsx";
import {ALEDriverManagement} from "../ale/haulier/management/DriverManagement.jsx";
import {ALEAddDriver} from "../ale/haulier/management/AddDriver.jsx";
import {ALEPrimeMoverManagement} from "../ale/haulier/management/PrimeMoverManagement.jsx";
import {ALETrailerManagement} from "../ale/haulier/management/TrailerManagement.jsx";
import {ALEAddPrimeMover} from "../ale/haulier/management/AddPrimeMover.jsx";
import {ALEAddTrailer} from "../ale/haulier/management/AddTrailer.jsx";
import {ALEEditAssignBooking} from "../ale/haulier/booking/EditAssignBooking.jsx";
import {ALEViewECsnPDF} from "../ale/haulier/booking/ViewBookingPDF.jsx";
import {ALECreateBookingForm} from "../ale/haulier/booking/CreateBookingForm.jsx";
import {ALEEditCreateBooking} from "../ale/haulier/booking/EditCreateBooking.jsx";
import {TerminalDashboard} from "../ale/terminal/TerminalDashboard.jsx";
import {CustomsDashboard} from "../ale/customs/dashboard/CustomsDashboard.jsx";
import {AKPSDashboard} from "../ale/akps/dashboard/AKPSDashboard.jsx";
import {ViewTerminal} from "../ale/terminal/ViewTerminal.jsx";
import {AkpsbookingList} from "../ale/akps/booking/AkpsbookingList.jsx";
import {AkpsbookingDetails} from "../ale/akps/booking/AkpsbookingDetails.jsx";
import {AkpsbookingAction} from "../ale/akps/booking/AkpsbookingAction.jsx";
import {CustomsbookingList} from "../ale/customs/booking/CustomsbookingList.jsx";
import {CustomsbookingDetails} from "../ale/customs/booking/CustomsbookingDetails.jsx";
import {CustomsbookingAction} from "../ale/customs/booking/CustomsbookingAction.jsx";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />}/>

                {/* CLE */}
                {/* Forwarding Routes */}
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
                    path="/rot/view/pdf/:id"
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
                    path="/haulier/booking/add/form1"
                    element={
                        <ProtectedRoute>
                            <CreateBookingForm />
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
                    path="/haulier/booking/edit/form1/:id"
                    element={
                        <ProtectedRoute>
                            <EditCreateBooking />
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
                {/* Forwarding Routes */}
                <Route
                    path="/ale/forwarding/dashboard"
                    element={
                        <ProtectedRoute>
                            <ALEForwardingDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/rot/add/form1"
                    element={
                        <ProtectedRoute>
                            <ALEAddROTForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/rot/add/form2"
                    element={
                        <ProtectedRoute>
                            <ALEAddROTForm2 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/akps/bookinglist"
                    element={
                        <ProtectedRoute>
                            <AkpsbookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customs/bookinglist"
                    element={
                        <ProtectedRoute>
                            <CustomsbookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/rot/history"
                    element={
                        <ProtectedRoute>
                            <ALEROTHistory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/rot/view/:id"
                    element={
                        <ProtectedRoute>
                            <ALEViewROTDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/rot/edit/form1/:id"
                    element={
                        <ProtectedRoute>
                            <ALEEditROTForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/rot/edit/form2/:id"
                    element={
                        <ProtectedRoute>
                            <ALEEditROTForm2 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/rot/view/pdf/:id"
                    element={
                        <ProtectedRoute>
                            <ALEViewROTPDF />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/rot/track"
                    element={
                        <ProtectedRoute>
                            <ALETrackROT />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/rot/document/view"
                    element={
                        <ProtectedRoute>
                            <ALEViewROTDocument />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/profile"
                    element={
                        <ProtectedRoute>
                            <ALEForwardingProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/profile/edit"
                    element={
                        <ProtectedRoute>
                            <ALEForwardingEditProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/dashboard"
                    element={
                        <ProtectedRoute>
                            <ALEHaulierDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking/add/form1"
                    element={
                        <ProtectedRoute>
                            <ALECreateBookingForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking"
                    element={
                        <ProtectedRoute>
                            <ALEYourBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking/view/:id"
                    element={
                        <ProtectedRoute>
                            <ALEViewBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking/assign/:id"
                    element={
                        <ProtectedRoute>
                            <ALEAssignBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking/accepted"
                    element={
                        <ProtectedRoute>
                            <ALEAcceptedBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking/accepted/edit/:id"
                    element={
                        <ProtectedRoute>
                            <ALEEditAssignBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking/view/eCSN/:id"
                    element={
                        <ProtectedRoute>
                            <ALEViewECsnPDF />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/booking/edit/form1/:id"
                    element={
                        <ProtectedRoute>
                            <ALEEditCreateBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/management/configure"
                    element={
                        <ProtectedRoute>
                            <ALEHaulierManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/manage/drivers"
                    element={
                        <ProtectedRoute>
                            <ALEDriverManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/add/driver"
                    element={
                        <ProtectedRoute>
                            <ALEAddDriver />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/manage/prime-movers"
                    element={
                        <ProtectedRoute>
                            <ALEPrimeMoverManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/add/prime-mover"
                    element={
                        <ProtectedRoute>
                            <ALEAddPrimeMover />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/manage/trailers"
                    element={
                        <ProtectedRoute>
                            <ALETrailerManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/haulier/add/trailer"
                    element={
                        <ProtectedRoute>
                            <ALEAddTrailer />
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
                <Route
                    path="/terminal/view/:id"
                    element={
                        <ProtectedRoute>
                            <ViewTerminal />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/akps/booking/bookingdetails/:id"
                    element={
                        <ProtectedRoute>
                            <AkpsbookingDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/akps/booking/bookingaction/:id"
                    element={
                        <ProtectedRoute>
                            <AkpsbookingAction />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/customs/booking/bookingdetails/:id"
                    element={
                        <ProtectedRoute>
                            <CustomsbookingDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/customs/booking/bookingaction/:id"
                    element={
                        <ProtectedRoute>
                            <CustomsbookingAction />
                        </ProtectedRoute>
                    }
                />
                {/* Fallback */}
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    )
}