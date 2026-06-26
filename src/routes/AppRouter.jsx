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
import {ForwardingProfile} from "../cle/profile/ForwardingProfile.jsx";
import {ForwardingEditProfile} from "../cle/profile/ForwardingEditProfile.jsx";
import {HaulierDashboard} from "../cle/haulier/dashboard/HaulierDashboard.jsx";
import {YourBookings} from "../cle/haulier/booking/YourBookings.jsx";
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
import {ALEROTHistory} from "../ale/forwarding/ROTHistory/ROTHistory.jsx";
import {ALEViewROTDetails} from "../ale/forwarding/ROTHistory/ViewROTDetails.jsx";
import {ALEViewROTPDF} from "../ale/forwarding/ROTHistory/ViewROTPDF.jsx";
import {ALETrackROT} from "../ale/forwarding/TrackROT/TrackROT.jsx";
import {ALEViewROTDocument} from "../ale/forwarding/Document/ViewROTDocument.jsx";
import {ALEProfile} from "../ale/profile/Profile.jsx";
import {ALEEditProfile} from "../ale/profile/EditProfile.jsx";
import {ALEHaulierDashboard} from "../ale/haulier/dashboard/HaulierDashboard.jsx";
import {ALEYourBookings} from "../ale/haulier/booking/YourBookings.jsx";
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
import {TerminalList} from "../ale/terminal/TerminalList.jsx"
import {UserManagement} from "../ale/UserManagement/UserManagement.jsx";
import {ViewUser} from "../ale/UserManagement/ViewUser.jsx";
import {AddUser} from "../ale/UserManagement/AddUser.jsx";
import {SearchROT} from "../ale/forwarding/ROT/ROTSearch.jsx";
import {BADashboard} from "../ale/bookingAgent/dashboard/BADashboard.jsx";
import {ALEYourSubmissions} from "../ale/bookingAgent/rot/YourSubmissions.jsx";
import {ALEViewSubmission} from "../ale/bookingAgent/rot/ViewSubmission.jsx";
import {ALECreateROT} from "../ale/bookingAgent/rot/CreateROT.jsx";
import {ALEEditSubmission} from "../ale/bookingAgent/rot/EditSubmission.jsx";
import {ALEYourROTs} from "../ale/bookingAgent/rot/YourROTs.jsx";
import {ALEConsigneeDashboard} from "../ale/consignee/dashboard/ConsigneeDashboard.jsx";
import {ALEConsigneeYourBookings} from "../ale/consignee/rot/YourBookings.jsx";
import {ALEEditBooking} from "../ale/consignee/rot/EditBooking.jsx";
import {ALEViewBooking} from "../ale/consignee/rot/ViewBooking.jsx";
import {ALEConsigneeYourROTs} from "../ale/consignee/rot/YourROTs.jsx";
import {ALEConsigneeArchivedROTs} from "../ale/consignee/rot/ArchivedROTs.jsx";
import {ALEAssignedNewBookings} from "../ale/forwarding/Booking/AssignedNewBookings.jsx";
import {ALEViewAssignedNewBooking} from "../ale/forwarding/Booking/ViewAssignedNewBooking.jsx";
import {TerminalOperationHours} from "../ale/terminal/operation/TerminalOperationHours.jsx";
/*import RegisterPage from "../registration/RegisterAccount.jsx";*/
import ForgotPasswordPage from "../forgotPassword/ForgotPassword.jsx";
import {PortDashboard} from "../cle/port/dashboard/PortDashboard.jsx";
import {PortBookingList} from "../cle/port/booking/PortBookingList.jsx"
import {PortViewBooking} from "../cle/port/booking/PortViewBooking.jsx";
import {PortEditBooking} from "../cle/port/booking/PortEditBooking.jsx";
import {CLECustomsDashboard} from "../cle/customs/dashboard/CLECustomsDashboard.jsx";
import {CLECustomsbookingList} from "../cle/customs/booking/CLECustomsbookingList.jsx";
import {CLECustomsbookingDetails} from "../cle/customs/booking/CLECustomsbookingDetails.jsx";
import { CLECustomsbookingAction } from "../cle/customs/booking/CLECustomsbookingAction.jsx";
import { YourQRCode } from "../ale/terminal/qrcode/YourQRCode.jsx";
import {DepotDashboard} from "../cle/depot/dashboard/DepotDashboard.jsx";
import {DepotBookingList} from "../cle/depot/booking/DepotBookingList.jsx"
import {DepotViewBooking} from "../cle/depot/booking/DepotViewBooking.jsx";
import {DepotEditBooking} from "../cle/depot/booking/DepotEditBooking.jsx";
import {ConsigneeDashboard} from "../cle/consignee/dashboard/ConsigneeDashboard.jsx";
import {ConsigneeBookingList} from "../cle/consignee/booking/ConsigneeBookingList.jsx"
import {ConsigneeViewBooking} from "../cle/consignee/booking/ConsigneeViewBooking.jsx";
import {ConsigneeEditBooking} from "../cle/consignee/booking/ConsigneeEditBooking.jsx";
import {ShippingLineDashboard} from "../cle/shippingLine/dashboard/ShippingLineDashboard.jsx";
import {ShippingLineBookingList} from "../cle/shippingLine/booking/ShippingLineBookingList.jsx"
import {ShippingLineViewBooking} from "../cle/shippingLine/booking/ShippingLineViewBooking.jsx";
import {ShippingLineEditBooking} from "../cle/shippingLine/booking/ShippingLineEditBooking.jsx";
import {DepotOperationHours} from "../cle/depot/operation/DepotOperationHours.jsx";
export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/register" element={<LoginPage />}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage />}/>

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
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ForwardingProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/edit"
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
                    path="/haulier/booking/accepted/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditAssignBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/booking/view/eCSN/:id"
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
                    path="/ale/forwarding/rot/search"
                    element={
                        <ProtectedRoute>
                            <SearchROT />
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
                    path="/ale/forwarding/booking/new"
                    element={
                        <ProtectedRoute>
                            <ALEAssignedNewBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/forwarding/booking/new/view"
                    element={
                        <ProtectedRoute>
                            <ALEViewAssignedNewBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/akps/bookinglist"
                    element={
                        <ProtectedRoute>
                            <AkpsbookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/customs/bookinglist"
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
                    path="/ale/rot/view/:id"
                    element={
                        <ProtectedRoute>
                            <ALEViewROTDetails />
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
                    path="/ale/profile"
                    element={
                        <ProtectedRoute>
                            <ALEProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/profile/edit"
                    element={
                        <ProtectedRoute>
                            <ALEEditProfile />
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
                {/*<Route*/}
                {/*    path="/ale/haulier/booking/accepted/edit/:id"*/}
                {/*    element={*/}
                {/*        <ProtectedRoute>*/}
                {/*            <ALEEditAssignBooking />*/}
                {/*        </ProtectedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                <Route
                    path="/ale/booking/view/eCSN/:id"
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
                            <ALEEditAssignBooking />
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
                    path="/ale/terminal/operations"
                    element={
                        <ProtectedRoute>
                            <TerminalOperationHours />
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
                <Route
                    path="/ale/terminal/terminalList"
                    element={
                        <ProtectedRoute>
                            <TerminalList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/terminal/qrcode"
                    element={
                        <ProtectedRoute>
                            <YourQRCode />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/management"
                    element={
                        <ProtectedRoute>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/management/view/:id"
                    element={
                        <ProtectedRoute>
                            <ViewUser />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/management/add"
                    element={
                        <ProtectedRoute>
                            <AddUser />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/bookingAgent/dashboard"
                    element={
                        <ProtectedRoute>
                            <BADashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/bookingAgent/rot/add/form"
                    element={
                        <ProtectedRoute>
                            <ALECreateROT />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/bookingAgent/submission/history"
                    element={
                        <ProtectedRoute>
                            <ALEYourSubmissions />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/bookingAgent/submission/view/:id"
                    element={
                        <ProtectedRoute>
                            <ALEViewSubmission />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/bookingAgent/submission/edit/:id"
                    element={
                        <ProtectedRoute>
                            <ALEEditSubmission />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/bookingAgent/rot/history"
                    element={
                        <ProtectedRoute>
                            <ALEYourROTs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/bookingAgent/rot/view/:id"
                    element={
                        <ProtectedRoute>
                            <AddUser />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/consignee/dashboard"
                    element={
                        <ProtectedRoute>
                            <ALEConsigneeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/consignee/booking/history"
                    element={
                        <ProtectedRoute>
                            <ALEConsigneeYourBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/consignee/booking/view/:id"
                    element={
                        <ProtectedRoute>
                            <ALEViewBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/consignee/booking/edit/:id"
                    element={
                        <ProtectedRoute>
                            <ALEEditBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/consignee/rot/history"
                    element={
                        <ProtectedRoute>
                            <ALEConsigneeYourROTs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ale/consignee/rot/archived"
                    element={
                        <ProtectedRoute>
                            <ALEConsigneeArchivedROTs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/port/dashboard"
                    element={
                        <ProtectedRoute>
                            <PortDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/port/booking/list"
                    element={
                        <ProtectedRoute>
                            <PortBookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/port/booking/view/:id"
                    element={
                        <ProtectedRoute>
                            <PortViewBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/port/booking/edit/:id"
                    element={
                        <ProtectedRoute>
                            <PortEditBooking/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customs/dashboard"
                    element={
                        <ProtectedRoute>
                            <CLECustomsDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customs/bookinglist"
                    element={
                        <ProtectedRoute>
                            <CLECustomsbookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customs/booking/bookingdetails/:id"
                    element={
                        <ProtectedRoute>
                            <CLECustomsbookingDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customs/booking/bookingaction/:id"
                    element={
                        <ProtectedRoute>
                            <CLECustomsbookingAction />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/depot/dashboard"
                    element={
                        <ProtectedRoute>
                            <DepotDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/depot/booking/list"
                    element={
                        <ProtectedRoute>
                            <DepotBookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/depot/booking/view/:id"
                    element={
                        <ProtectedRoute>
                            <DepotViewBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/depot/booking/edit/:id"
                    element={
                        <ProtectedRoute>
                            <DepotEditBooking/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consignee/dashboard"
                    element={
                        <ProtectedRoute>
                            <ConsigneeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consignee/booking/list"
                    element={
                        <ProtectedRoute>
                            <ConsigneeBookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consignee/booking/view/:id"
                    element={
                        <ProtectedRoute>
                            <ConsigneeViewBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consignee/booking/edit/:id"
                    element={
                        <ProtectedRoute>
                            <ConsigneeEditBooking/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shippingLine/dashboard"
                    element={
                        <ProtectedRoute>
                            <ShippingLineDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shippingLine/booking/list"
                    element={
                        <ProtectedRoute>
                            <ShippingLineBookingList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shippingLine/booking/view/:id"
                    element={
                        <ProtectedRoute>
                            <ShippingLineViewBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shippingLine/booking/edit/:id"
                    element={
                        <ProtectedRoute>
                            <ShippingLineEditBooking/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/depot/operations"
                    element={
                        <ProtectedRoute>
                            <DepotOperationHours />
                        </ProtectedRoute>
                    }
                />
                {/* Fallback */}
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    )
}