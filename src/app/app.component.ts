import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ethers } from 'ethers';
import { FormControl, Validators } from '@angular/forms';

declare let window:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef){}

  private provider: any | undefined;
  
  nameForm: FormControl = new FormControl('', [Validators.required]);
  versionForm: FormControl = new FormControl('', [Validators.required]);
  chainIdForm: FormControl = new FormControl('', [Validators.required]);
  verifierForm: FormControl = new FormControl('', [Validators.required]);
  functionNameForm: FormControl = new FormControl('', [Validators.required]);
  functionMemberForm: FormControl = new FormControl('', [Validators.required]);
  functionMessageForm: FormControl = new FormControl('', [Validators.required]);

  wallet: string | undefined;
  networkId: number | undefined;
  signature: string | undefined;
  s: string | undefined;
  r: string | undefined;
  v: number | undefined;
  metamaskInstalled: boolean = false;

  async ngOnInit(): Promise<void>{
    let isMetamaskAvailable = window.ethereum?.isMetaMask;

    if(isMetamaskAvailable === true && isMetamaskAvailable !== undefined){
      this.metamaskInstalled = true;
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      window.ethereum.on('disconnect', () => {
        this.wallet = undefined;
        this.chainIdForm.setValue(undefined);
        this.chainIdForm.enable();
        this.cdr.detectChanges();
      });
      window.ethereum.on('accountsChanged', () => {
        this.wallet = undefined;
        this.chainIdForm.setValue(undefined);
        this.chainIdForm.enable();
        this.cdr.detectChanges();
      });
      window.ethereum.on('chainChanged', () => {
        this.wallet = undefined;
        this.chainIdForm.setValue(undefined);
        this.chainIdForm.enable();
        this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }else{
      console.log("Please install metamask")
    }
  }

  async signWithEther(): Promise<void> {
    if(
      this.nameForm.valid &&
      this.versionForm.valid &&
      this.verifierForm.valid &&
      this.functionNameForm.valid &&
      this.functionMemberForm.valid &&
      this.functionMessageForm.valid
    ){
      this.signature = undefined;
      this.v = undefined;
      this.r = undefined;
      this.s = undefined;

      try{
        const domain = {
          name: (this.nameForm.value).toString(),
          version: (this.versionForm.value).toString(),
          chainId: parseInt(this.chainIdForm.value),
          verifyingContract: (this.verifierForm.value).toString(),
        };
        console.log(domain)
  
        const functionName = (this.functionNameForm.value).toString();
        const typesString = `{"${functionName}": ${this.functionMemberForm.value}}`;
        console.log(typeof(typesString), typesString)
        const types = JSON.parse(typesString);
        console.log(types);
        const message = JSON.parse(this.functionMessageForm.value)
        console.log(message)
  
        const signature = await this.provider.getSigner(this.wallet!)._signTypedData(
          domain,
          types,
          message
        );
  
        this.signature = signature;
        console.log(this.signature);
  
        const verify = await ethers.utils.verifyTypedData(
          domain,
          types,
          message,
          signature
        );

        console.log(verify);

        const v = "0x" + signature.slice(130, 132);
        const r = signature.slice(0, 66);
        const s = "0x" + signature.slice(66, 130);
    
        this.v = ethers.BigNumber.from(v.toString()).toNumber();
        this.r = r;
        this.s = s;
      }catch(e: any){
        console.log(e);
        alert(e.message);
      }

      this.cdr.detectChanges();
    }else{
      console.log("fill all form!");
      alert("fill all form!");
    }
  }
}
