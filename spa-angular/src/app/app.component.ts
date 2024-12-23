import { CommonModule } from '@angular/common';  // Mengimpor CommonModule agar dapat menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';  // Mengimpor RouterModule
import { RouterOutlet } from '@angular/router';  // Mengimpor RouterOutlet
import { Router } from '@angular/router';  // Mengimpor Router

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule], // Menambahkan RouterOutlet, RouterModule
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'spa-angular';
  constructor(private router: Router) { } // Menambahkan router pada konstruktor
  
}
