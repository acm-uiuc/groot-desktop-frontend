/** ConferenceController
    Responsible for content home view
    - Contacts groot for list of ACM events
    - Interfaces with the GROOT API GATEWAY
**/
app.controller('AboutCtrl', function ($scope){

    $scope.groups = [
            {
                name: 'Top4',
                contacts: [
                    {
                        title: 'Chair',
                        name: 'Naren Dasan',
                        email: 'acm@illinois.edu'
                    },{
                        title: 'Vice Chair',
                        name: 'Sathvika Ashokkumar',
                        email: 'vice-chair@acm.illinois.edu'
                    },{
                        title: 'Treasurer',
                        name: 'Tommy Yu',
                        email: 'treasurer@acm.illinois.edu'
                    },{
                        title: 'Secretary',
                        name: 'Alec Kochevar-Cureton',
                        email: 'secretary@acm.illinois.edu'
                    }
                ]
            }, {
                name: 'Admin',
                contacts: [
                    {
                        email: 'admin@acm.illinois.edu'
                    }
                ]
            }, {
                name: 'Corporate',
                contacts: [
                    {
                        name: 'Amanda Sopkin'
                    },{
                        name: 'Sujay Khandekar'
                    },{
                        name: 'Tyler Kim'
                    },{
                        email: 'corporate@acm.illinois.edu'
                    }
                ]
            },{
                name: 'Projects',
                contacts: [
                    {
                        name: 'Kevin Wang',
                        title: 'Co-Chair'
                    },{
                        email: 'projects@acm.illinois.edu'
                    }
                ]
            },{
                name: 'Social',
                contacts: [
                    {
                        name: 'Laura Licari',
                        title: 'Chair'
                    },{
                        email: 'social@acm.illinois.edu'
                    }
                ]
            },{
                name: 'Banks of the Boneyard',
                contacts: [
                    {
                        name: 'Connie Fan',
                        title: 'Editor'
                    },{
                        email: 'boneyard@acm.illinois.edu'
                    }
                ]
            }

    ];

    console.log($scope.groups);

});
