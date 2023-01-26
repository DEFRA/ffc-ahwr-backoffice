Feature: As an internal user
I want to see the most recent information on the AHWR agreements page
So that I can be certain that the information on the AHWR agreement page is correct and up to date.



Scenario: Agreement page

Given I am on the AHWR page "false"
When I scroll up and around the AHWR page
Then the page's title should be "Annual health and welfare review agreements"
And all other titles and content should display the correct information

Scenario: Search by organization
Given I am on the AHWR page "true"
When I enter the name "Livsey's Farm" as the organisation in the search bar and press the search button
Then a list agreement should be displayed for the organisation "Livsey's Farm"


#npx wdio run ./wdio.local.conf.js  --spec ./fearures/AHWRAgreements.feature
#npx wdio run ./wdio.local.conf.js --spec ./fearures/Claimtab.feature
#npx wdio run ./wdio.local.conf.js --spec ./fearures/Claimtab.feature --spec ./fearures/AHWRAgreements.feature
