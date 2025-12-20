import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MenubarModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: ['/']
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      routerLink: ['/about']
    }
  ];
}