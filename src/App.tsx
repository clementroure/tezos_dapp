import './App.css';
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { InMemorySigner } from '@taquito/signer';
import {
  ColorMode,
  Network,
  NetworkType,
  TezosOperationType,
} from "@airgap/beacon-sdk";

function App() {

  // Set the network (Mainnet is default)
  const network: Network = { type: NetworkType.GHOSTNET };

  const Tezos = new TezosToolkit("https://ghostnet.ecadinfra.com");
  const wallet = new BeaconWallet({
    name: "Beacon Docs",
    preferredNetwork: network.type,
  }); // Takes the same arguments as the DAppClient constructor

  Tezos.setWalletProvider(wallet);

  let myAddress: string | undefined;

  // OPTIONAL: Set the color mode
  // Read the current theme of the docs page from local storage. This depends on your dApp state
  const theme = localStorage.getItem("theme");
  wallet.client.setColorMode(
    theme === "dark" ? ColorMode.DARK : ColorMode.LIGHT
  );

  const walletButton = async ()  => {

    // This code should be called every time the page is loaded or refreshed to see if the user has already connected to a wallet.
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      // If defined, the user is connected to a wallet.
      // You can now do an operation request, sign request, or send another permission request to switch wallet
      console.log("Already connected:", activeAccount.address);

      // You probably want to show the address in your UI somewhere.
      myAddress = activeAccount.address;
    } else {
      // The user is NOT connected to a wallet.

      // The following permission request should not be called on pageload,
      // it should be triggered when the user clicks on a "connect" button on your page.
      // This will trigger the pairing alert UI where the user can select which wallet to pair.
      wallet.requestPermissions({
        network: network,
      });
      myAddress = await wallet.getPKH();
      console.log("New connection: ", myAddress);
    }

    // At this point we are connected to an account.
    // Let's send a simple transaction to the wallet that sends 1 mutez to ourselves.
    const hash = await wallet.sendOperations([
      {
        kind: TezosOperationType.TRANSACTION,
        destination: myAddress, // Send to ourselves
        amount: "1", // Amount in mutez, the smallest unit in Tezos
      },
    ]);

    console.log("Operation Hash:", hash);

    // Let's generate a link to see the transaction on a block explorer
    const explorerLink = await wallet.client.blockExplorer.getTransactionLink(
      hash,
      network
    );

    console.log("Block Explorer:", explorerLink);

    // TODO: Remove temporary workaround in sandbox
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // If you want to "disconnect" a wallet, clear the active account.
    // This means the next time the active account is checked or a permission request is triggered, it will be like it's the users first interaction.
    await wallet.clearActiveAccount();
  }

  const interactContract = async () => {

    // more used for Back-End as private key cant change + risky

    // Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey('') });
    // Tezos.contract
    //   .at('KT1BJadpDyLCACMH7Tt9xtpx4dQZVKw9cDF7')
    //   .then((contract) => {
    //     const i = 7;

    //     console.log(`Incrementing storage value by ${i}...`);
    //     return contract.methods.increment(i).send();
    //   })
    //   .then((op) => {
    //     console.log(`Waiting for ${op.hash} to be confirmed...`);
    //     return op.confirmation(3).then(() => op.hash); // 3 = number of transactions to wait
    //   })
    //   .then((hash) => console.log(`Operation injected: https://ghost.tzstats.com/${hash}`))
    //   .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));

    // wallet for frontend / contract for backend

    Tezos.wallet
      .at('KT1BJadpDyLCACMH7Tt9xtpx4dQZVKw9cDF7')
      .then((contract) => {
        const i = 7;

        console.log(`Incrementing storage value by ${i}...`);
        return contract.methods.increment(i).send();
      })
      .then((op) => {
        console.log(`Waiting for ${op.opHash} to be confirmed...`);
        return op.confirmation(3).then(() => op.opHash); // 3 = number of transactions to wait
      })
      .then((hash) => console.log(`Operation injected: https://ghost.tzstats.com/${hash}`))
      .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
  }

  return (
    <div className="App">
      <div>
        <button onClick={walletButton} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8">
          Connect Wallet
        </button>
      </div>
      <div>
        <button onClick={interactContract} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8">
          Interact Contract
        </button>
      </div>
    </div>
  );
}

export default App;
