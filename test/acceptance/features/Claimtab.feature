Feature: As an internal user
I want to know when the claim application has been submitted
So that I can view the details provided by the applicant.
story 129641



Scenario: Claim Status
Given a claim has been submitted with agreement number "AHWR-5FF7-212A"
When I click the Claim tab
Then the displayed data set's title should be "Claimed"

Scenario: Claim tab data sets
Given I am on the view agreement page for agreement "AHWR-220D-02E7"
When I click the Claim tab
Then following data set "Yes" "17/11/2022" "17/11/2022" "livsey williams" "1235566" "1597532" should be displayed
