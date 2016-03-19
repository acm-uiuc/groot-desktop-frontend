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
                        name: 'Sujay Khandekar',
                        email: 'acm@illinois.edu'
                    },{
                        title: 'Vice Chair',
                        name: 'Laura Licari',
                        email: 'vice-chair@acm.illinois.edu'
                    },{
                        title: 'Treasurer',
                        name: 'Sebastian Conybeare',
                        email: 'treasurer@acm.illinois.edu'
                    },{
                        title: 'Secretary',
                        name: 'Connie Fan',
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
                        name: 'Zach Millier'
                    },{
                        name: 'Amanda Sopkin'
                    },{
                        name: 'Mike Parilla'
                    },{
                        name: 'Aashna Makkar'
                    },{
                        name: 'David Zmick'
                    },{
                        name: 'Karunya Tota'
                    },{
                        name: 'Harshit Kumar'
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
                        name: 'Milan Dasgupta',
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
