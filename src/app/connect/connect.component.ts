import { Component, OnInit } from '@angular/core';

import { KernelService } from '../scripted-forms/kernel.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})
export class ConnectComponent implements OnInit {
  ip: string;
  port: string;
  token: string;

  constructor(
    private myKernelSevice: KernelService
  ) { }

  ngOnInit() {
    this.ip = this.myKernelSevice.ip;
    this.port = this.myKernelSevice.port;
    this.token = this.myKernelSevice.token;
  }

  connect() {
    this.myKernelSevice.defineSettings(this.ip, this.port, this.token);
  }

}
