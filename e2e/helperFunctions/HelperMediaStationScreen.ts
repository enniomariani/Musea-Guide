export async function openMediaStation(id:number, expectToBeAbleToOpen:boolean): Promise<void> {
    console.log("Test / Open MediaStation: ", id, " expectToBeAbleToOpen: ", expectToBeAbleToOpen);

    //open mediastation
    await $('#item' + id.toString()).click();

    if(expectToBeAbleToOpen){
        //wait until the "accept opening the station" dialog is shown
        await $('#btnYes').waitForDisplayed({timeout: 30000});

        //accept to open the mediastation
        await $('#btnYes').click();

        //wait until the exit-button is shown -> the mediastation is open
        await $('#exitBtn').waitForDisplayed({ timeout: 5000});
    }
}

export async function exitMediaStation(): Promise<void> {
    console.log("Test / Exit MediaStation");

    await $('#exitBtn').click();
    //wait until the dialog to close the MS is shown
    await $('#btnYes').waitForDisplayed({timeout: 30000});

    //accept to close the mediastation
    await $('#btnYes').click();

    await $('#infoText').waitForDisplayed({ timeout: 30000, reverse:true});

}

export async function restartApp():Promise<void>{
    console.log("Test / Restart App");

    await browser.reloadSession();
    await $('#infoText').waitForDisplayed({ timeout: 30000, reverse:true});
}