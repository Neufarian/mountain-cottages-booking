import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TouristComponent } from './tourist/tourist.component';
import { OwnerComponent } from './owner/owner.component';
import { AdminComponent } from './admin/admin.component';
import { TouristProfileComponent } from './tourist.profile/tourist.profile.component';
import { TouristCottagesComponent } from './tourist.cottages/tourist.cottages.component';
import { TouristReservationsComponent } from './tourist.reservations/tourist.reservations.component';
import { OwnerProfileComponent } from './owner.profile/owner.profile.component';
import { OwnerCottagesComponent } from './owner.cottages/owner.cottages.component';
import { OwnerReservationsComponent } from './owner.reservations/owner.reservations.component';
import { OwnerStatisticsComponent } from './owner.statistics/owner.statistics.component';
import { TouristCottagesDetailsComponent } from './tourist.cottages.details/tourist.cottages.details.component';

export const routes: Routes = [
    {path:"", component:LoginComponent},
    {
        path:"tourist",
        component:TouristComponent,
        children: [
            {path:"profile", component:TouristProfileComponent},
            {path:"cottages", component:TouristCottagesComponent},
            {path:"reservations", component:TouristReservationsComponent},
            {path:"", redirectTo:"profile", pathMatch:"full"}
        ]
    },
    {path:"cottage/:id", component: TouristCottagesDetailsComponent},
    {
        path:"owner",
        component:OwnerComponent,
        children: [
            {path:"profile", component:OwnerProfileComponent},
            {path:"cottages", component:OwnerCottagesComponent},
            {path:"reservations", component:OwnerReservationsComponent},
            {path:"statistics", component:OwnerStatisticsComponent},
            {path:"", redirectTo:"profile", pathMatch:"full"}
        ]
    },
    {path:"admin", component:AdminComponent},
    {path:"hidden", component:LoginComponent}
];
