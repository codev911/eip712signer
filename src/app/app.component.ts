import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

declare let window:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef){}

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
  metamaskInstalled: boolean = false;

  async ngOnInit(): Promise<void>{
    let isMetamaskAvailable = window.ethereum?.isMetaMask;

    if(isMetamaskAvailable === true && isMetamaskAvailable !== undefined){
      this.metamaskInstalled = true;
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

  async sign(): Promise<void> {
    if(
      this.nameForm.valid &&
      this.versionForm.valid &&
      this.verifierForm.valid &&
      this.functionNameForm.valid &&
      this.functionMemberForm.valid &&
      this.functionMessageForm.valid
    ){
      try{
        const domain = [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ];
        const domainData = {
          name: (this.nameForm.value).toString(),
          version: (this.versionForm.value).toString(),
          chainId: parseInt(this.chainIdForm.value),
          verifyingContract: (this.verifierForm.value).toString(),
        };
  
  
        const functionName = (this.functionNameForm.value).toString();
        const typesString = `[{"EIP712Domain": ${JSON.stringify(domain)}, "${functionName}": ${this.functionMemberForm.value}}]`;
        console.log(typeof(typesString), typesString)
        const types = JSON.parse(typesString);
        console.log(types);
        const inputmessage = JSON.parse(this.functionMessageForm.value)
        console.log(inputmessage)
  
        const data = JSON.stringify({
          types: types[0],
          domain: domainData,
          primaryType: functionName,
          message: inputmessage
        });
        console.log(data);
  
        const signature = await window.ethereum.request({
          method: 'eth_signTypedData_v4',
          params: [this.wallet!, data],
          from: this.wallet!
        });
  
        this.signature = signature;
        console.log(this.signature);
      }catch(e: any){
        console.log(e);
        alert(e.message);
      }
    }else{
      console.log("fill all form!");
      alert("fill all form!");
    }
  }
}
