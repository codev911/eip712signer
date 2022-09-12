import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { FormControl, Validators } from '@angular/forms';

declare let window:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  nameForm: FormControl = new FormControl('', [Validators.required]);
  versionForm: FormControl = new FormControl('', [Validators.required]);
  chainIdForm: FormControl = new FormControl('', [Validators.required]);
  verifierForm: FormControl = new FormControl('', [Validators.required]);
  functionNameForm: FormControl = new FormControl('', [Validators.required]);
  functionMemberForm: FormControl = new FormControl('', [Validators.required]);
  functionMessageForm: FormControl = new FormControl('', [Validators.required]);

  wallet: string | undefined;
  networkId: number | undefined;
  metamaskInstalled: boolean = false;

  async ngOnInit(): Promise<void>{
    let isMetamaskAvailable = window.ethereum?.isMetaMask;

    if(isMetamaskAvailable === true && isMetamaskAvailable !== undefined){
      this.metamaskInstalled = true;
      window.ethereum.on('disconnect', () => {
        this.wallet = undefined;
        this.chainIdForm.setValue(undefined);
        this.chainIdForm.enable();
      });
      window.ethereum.on('accountsChanged', () => {
        this.wallet = undefined;
        this.chainIdForm.setValue(undefined);
        this.chainIdForm.enable();
      });
      window.ethereum.on('chainChanged', () => {
        this.wallet = undefined;
        this.chainIdForm.setValue(undefined);
        this.chainIdForm.enable();
      });
    }else{
      console.log("Please install metamask first");
    }
  }

  async connect(){
    if(this.metamaskInstalled){
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const data = await Promise.all([
        await window.ethereum.request({
          method: 'eth_accounts'
        }),
        await window.ethereum.request({
          method: 'net_version'
        })
      ]);

      // console.log(await data);
  
      this.wallet = await data[0][0];
      this.networkId = parseInt(await data[1]);
      this.chainIdForm.setValue(this.networkId);
      this.chainIdForm.disable();
    }else{
      console.log("Please install metamask")
    }
  }
}
