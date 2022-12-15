Feature: As an internal user
I want to see all the statuses that are linked to all applications on the AHWR application page.
So that I can be informed about the progress or stage of an application.

Scenario: Agreed Status Not Agreed and Claimed
Given I am on the AHWR page "false"
And the application table is displayed
Then the status of each application should be displayed on AHWR pages

