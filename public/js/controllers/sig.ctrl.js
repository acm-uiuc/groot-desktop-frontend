/** SIGController
    Responsible for content home view
    - Allows for dynamic home page content
    - Interfaces with the GROOT API GATEWAY
**/
app.controller('SIGCtrl', function ($scope){
    // uses groot-sigs service to list,
    // perhaps easy joins of SIGs would need to contact users/sigs to validate new member
    // will be hard coded for now
    // WARNING: THE FOLLOWING SHOULD HORRIFY YOU AND CONVICE YOU OF THE NEED TO MOVE THIS TO A BACKEND SERVICE
    // BTW: This is basically the schema for the sigs service and this is basically json (should be easy) (the users should be objects)
    $scope.sigs = [
        {
            name:'Gamebuilders',
            description: "Anything and everything related to game development",
            Chairs:'Michael Parilla',
            meetingTime:'19:00',
            meetingDay:'Tuesday',
            meetingLoc:'Siebel 3405',
            site:'http://www.acm.uiuc.edu/gamebuilders/',
            members:[],
            email:'Gamebuilders@acm.uiuc.edu',
            join:false
        },
        {
            name:'GNU LUG',
            description: "GNU Linux Users Group",
            chairs:'Wayland Morgan, Jonathan Schipp',
            meetingTime:'20:00',
            meetingDay:'Monday',
            meetingLoc:'CSL 301',
            site:'http://www.acm.uiuc.edu/lug/',
            members:[],
            email:'Gnulug-l@acm.uiuc.edu',
            join:false
        },
        {
            name:'ICPC',
            description: "Facilitate the development of contest programming skills, with the goal of producing highly competitive teams in the prestigious ACM ICPC competition.",
            chairs:'Arthur Li, Matthew Worley',
            meetingTime:'18:00',
            meetingDay:'Tuesday',
            meetingLoc:'Siebel 218',
            site:' http://icpc.cs.illinois.edu/',
            members:[],
            email:'ICPC-l@acm.uiuc.edu',
            join:false
        },
        {
            name:'OpenNSM',
            description: "Special Interest Group for Open (sourced) Network Security Monitoring",
            chairs:'Shane Rogers, Jonathan Schipp',
            meetingTime:'18:00',
            meetingDay:'Monday',
            meetingLoc:'CSL 301',
            site:'http://open-nsm.net/',
            members:[],
            email:'Website-l@acm.uiuc.edu',
            join:false
        },
        {
            name:'SIGArt',
             description: "Special Interest Group for Artificial Intelligence",
             chairs:'Jordan Luber',
             meetingTime:'13:00',
             meetingDay:'Sunday',
             meetingLoc:'Siebel 1105',
             site:'http://www.acm.uiuc.edu/sigart/',
             members:[],
             email:'SIGArt-l@acm.uiuc.edu',
             join:false
         },
        {
            name:'SIGBio',
            description: "To pursue biological computing and cybernetics.",
            chairs:'Jennifer Kokkines, Austin Walters',
            meetingTime:'17:00',
            meetingDay:'Tuesday',
            meetingLoc:'',
            site:'',
            members:[],
            email:'SIGBio-l@acm.uiuc.edu',
            join:false
        },
        {
            name:'SIGBot',
            description: "Special Interest Group for Robotics",
            chairs:'Anna Galusza, Bryan Plummer',
            meetingTime:'14:00',
            meetingDay:'Sunday',
            meetingLoc:'Siebel 1105',
            site:'http://www.acm.uiuc.edu/sigbot/',
            members:[],
            email:' SIGBot@acm.uiuc.edu',
            join:false
        },
        {
            name:'SIGCHI',
            description: "Special Interest Group for Human-Computer Interaction.",
            chairs:'Andrew Kuznetsov',
            meetingTime:'17:00',
            meetingDay:'Wednesday',
            meetingLoc:'Siebel 1302',
            site:'http://www.acm.uiuc.edu/sigchi',
            members:[],
            email:'SIGCHI-l@acm.uiuc.edu',
            join:false
        },
        {
            name:'SIGCoin',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGDave',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGEducation',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGEmbedded',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGGRAPH',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGMIS',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGMobile',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGMusic',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGOps',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGPlan',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'SIGPony',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
             email:'',
             join:false
         },
        {
            name:'SIGSoft',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            email:'',
            join:false
        },
        {
            name:'WebMonkeys',
            description: "",
            chairs:'',
            meetingTime:'',
            meetingDay:'',
            meetingLoc:'',
            site:'',
            members:[],
            join:false
        }
    ];
});
