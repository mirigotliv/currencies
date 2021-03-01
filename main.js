"use strict";
///<reference path="jquery-3.5.1.js"/>

// initialization:
let currenciesJson;
const CURRENCIES_LIST = 0
const CURRENCY_INFO = 1
const CARDS_TO_DISPLAY = 256
const CARDS_TO_IGNORE = 1

$(function () {
    let currenciesArray = []
    const selectedCurrencies = []
    let isModalOpen = false
    let currentSearch = ''
    let hiddenCards = []

    // Activating the function of LoadCurrencies:
    LoadCurrencies();

    // A function that will work when the page loads:
    async function LoadCurrencies() {

        // displays the progress bar when the page loads:
        showProgressBar();

        //get the currencies response (json) from the WEB API
        currenciesArray = await getApiResponse(CURRENCIES_LIST);

        //run over the array of cards, and display all cards:
        for (let i = CARDS_TO_IGNORE; i < CARDS_TO_DISPLAY; i++) {
            addCardToGrid(currenciesArray[i], i);
        }
        // activating the function to hide the hideProgressBar(spiner) after the cards are shown:
        hideProgressBar();
    }

    
    // function for displays progress bar when the page loads:
    function showProgressBar() {
        $("#loadingBar").show();
    }

    // function for hide the progress bar after the page is loaded:
    function hideProgressBar() {
        $("#loadingBar").hide();
    }

    // function with switch to display the data of cards by api links:
    function getApiResponse(type, id) {
        let url;
        switch (type) {
            case CURRENCIES_LIST:
                url = "https://api.coingecko.com/api/v3/coins/list";
                break
            case CURRENCY_INFO:
                url = "https://api.coingecko.com/api/v3/coins/" + id;
                break
        }

        return $.ajax({
            url: url,
            type: 'GET',
            data: {
            },
            dataType: 'json',
        });
    }

    // when the user clicks on the "currencies" button(Navigation button),
    //  then the "About" page will be hidden and all cards will be displayed:
    $("#currenciesButton").click(() => {
        document.getElementById("aboutPage").style.display = 'none'
        document.getElementById("containerFluid").style.display = 'block'
    })

    // when the user clicks on the "about" button(Navigation button),
    //    then the "currencies" page will be hidden all data about the project
    //  and about me will be displayed:
    $("#about").click(() => {
        document.getElementById("containerFluid").style.display = 'none'
        document.getElementById("aboutPage").style.display = 'flex'
        const AboutTextField = document.getElementById("aboutTextField")
        AboutTextField.style.display = 'flex'
    })

    // If the user did not write anything,
    // then the search button will not work for him,
    // and only when he started writing even one letter of a symbol
    // for the currency in the input of the search
    // then he will be able to search for the currency
    $(".inputSearchCoin").keyup(event => {
        const input = event.target.value
        const notFound = document.getElementById("notFound")
        const SearchButton = document.getElementById("searchButton")
        if (input.length > 0) {
            SearchButton.style.cursor = 'pointer'
            SearchButton.style.opacity = '1'
        } else {
            SearchButton.style.cursor = 'not-allowed'
            SearchButton.style.opacity = '0.7'
        }

        // when the message to the user exists
        //  (message-that the currency he was looking for was not found),
        // so the cards with the currency information will not be displayed:
        notFound.style.display = 'none'
        hiddenCards.forEach(card => card.style.display = 'block')
        hiddenCards = []
        currentSearch = input

        // when the message to the user doesn't exist
        //  (message-that the currency he was looking for was not found),
        // , so the cards with the currency information will be displayed:
        const result = currenciesArray.filter(currency => !currency.id.includes(input))
        result.forEach(currency => {
            const cardToHide = document.getElementById(currency.id)
            if (cardToHide) {
                hiddenCards.push(cardToHide)
                cardToHide.style.display = 'none'
            }
        })

        if (hiddenCards.length === (CARDS_TO_DISPLAY - CARDS_TO_IGNORE)) {
            notFound.style.display = 'block'
        }
    });

    // function to dynamic appearance of the cards
    function addCardToGrid(currency = {}, index) {
        const div = document.createElement("div");
        div.className = "col-sm-4";
        div.id = currency.id
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.id = "card" + index;
        $(div).append(cardDiv);

        //  the information of the currencies in each card(symbol + name + id):
        let TextField = "<div id='textFieldContainer'><div id='textField" + index + "' class='textField'><div class='currency' id='priceUsd" + index + "'></div><div class='currency' id='priceEur" + index + "'></div><div class='currency' id='priceIls" + index + "'></div><div class='imageMoreInfoData'> <img class='img' id='img" + index + "' src=''></div><div id='description" + index + "'>Charging...</div></div></div>"
        let CardDivString = " <div id=" + currency.id + " class='symbol'>Symbol:" + " " + currency.symbol + "</div>";
        CardDivString += "<div class='cardInfo'>"
        CardDivString += "<span class='currencyName' id='currencyName" + index + "'>" + "Name:" + " " + currency.name + "</span>"
        CardDivString += "<label class='switch'> <input class='sliders' type='checkbox' id='slider" + index + "'>  <span class='slider round'></span> </label>"
        CardDivString = CardDivString + "</div>"

        $(cardDiv).append(CardDivString);
        // append button "More Info" to each card:
        let MoreInfoButton = "<div id='moreInfoContainer'><button class='btn btn-primary btn_card_more_info' type='button' id='moreInfo" + index + "'>More Info</button><div/>";
        $(cardDiv).append(MoreInfoButton);
        $(cardDiv).append(TextField);

        $("#div_row").append(div);

        // When the user clicks on the "more info" button,
        //  a "modal" window will open in which more information about the currency will be displayed.
        const openTextField = textField => {
            const description = document.getElementById("description" + index);
            // displays the height of the modal:
            cardDiv.style.height = "400px"
            textField.style.display = "flex"
            // Presentation of currency prices in euros and dollars and shekels:
            getApiResponse(CURRENCY_INFO, currency.id).then(response => {
                document.getElementById("img" + index).src = response.image.small
                document.getElementById("priceUsd" + index).innerHTML = response.market_data.current_price.usd + '$'
                document.getElementById("priceEur" + index).innerHTML = response.market_data.current_price.eur + '€'
                document.getElementById("priceIls" + index).innerHTML = response.market_data.current_price.ils + '₪'
                description.innerHTML = response.description['en']
            })
        }

        // When the user closes the modal,
        //  then the information of the modal is hidden:
        const closeTextField = textField => {
            textField.style.display = 'none'
            cardDiv.style.height = '160px'
        }

        // creating condition - if the modal (of "More Info" button) is open,
        //  show the information inside and if not then do not show anything
        $('#moreInfo' + index).click(function () {
            const textField = document.getElementById("textField" + index);
            if (textField.style.display !== 'flex') {
                openTextField(textField)
            } else {
                closeTextField(textField)
            }
        })


        $('#slider' + index).click(function () {
            const modal = document.getElementById("modal")
            if (isModalOpen) {
                return
            }
            // creating condition - if the slider is "closed",
            //  so  the currency will add, and if not- then the currency will delete:
            const slider = document.getElementById("slider" + index)
            if (slider.checked) {
                addCurrency()
            } else {
                deleteCurrency()
            }
        });

        // delete a currency by its index position:
        const deleteCurrency = (currentIndex = index) => {
            const currencyToDeleteIndex = selectedCurrencies.indexOf(currentIndex)
            selectedCurrencies.splice(currencyToDeleteIndex, 1)
        }

        const closeModal = (currencyToDelete = document.getElementById("currencyToDelete")) => {
            isModalOpen = false
            document.getElementById("modal").style.display = 'none'
            currencyToDelete.innerHTML = ''
            const sliders = document.getElementsByClassName("sliders")
            Object.keys(sliders).forEach(key => sliders[key].disabled = false)
        }

        // creating condition - If the user has entered less than 5 coins, 
        // he will be able to add another one:
        const addCurrency = (currentIndex = index) => {
            if (selectedCurrencies.length < 5) {
                selectedCurrencies.push(index)
            }
            else {
                const modal = document.getElementById("modal")
                modal.style.display = 'block'
                isModalOpen = true
                const sliders = document.getElementsByClassName("sliders")
                Object.keys(sliders).forEach(key => sliders[key].disabled = true)
                const currencyToDelete = document.getElementById("currencyToDelete")
                let deleteCurrencies = "<div>"
                selectedCurrencies.forEach(index => {

                    deleteCurrencies = deleteCurrencies.concat("</div><button id='delete" + index + "'>delete</button> Currency Name: " + currenciesArray[index].name + "</div><br>")
                })
                deleteCurrencies.concat("</div>")
                // option for the user to delete a coin from the 5 selected currency:
                $(currencyToDelete).append(deleteCurrencies)
                selectedCurrencies.forEach(index => {
                    $("#delete" + index).click(() => {
                        deleteCurrency(index)
                        const slider = document.getElementById("slider" + index)
                        slider.checked = false
                        selectedCurrencies.push(currentIndex)
                        closeModal(currencyToDelete)
                    })
                })
                // option for the user to deselect the last selected currency:
                document.getElementById("cancelButton").onclick = () => {
                    document.getElementById("slider" + index).checked = false
                    closeModal(currencyToDelete)
                }
            }
        }

        // "X" button that closes the modal that opens
        //  when the user selects more than 5 coins:
        $("#crossIcon").click(() => {
            closeModal()
            document.getElementById("cancelButton").click()
        })
    }

});