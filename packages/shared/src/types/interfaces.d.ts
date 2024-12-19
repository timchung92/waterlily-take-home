//interface Body {
//	message: string;
//}

//interface Citations {
//	slideIndex: number;
//	citation: JSX.Element;
//}

//interface User {
//	given_name: string;
//	challengeName: string;
//	challengeParam: {
//		userAttributes: {
//			givenName: string[];
//			familyName: string[];
//		};
//	};
//}

////interface Client {
////	firstName: string;
////	lastName: string;
////	tags: string[];
////	link: string;
////	clientId: string;
////	planStatus: number;
////	maxSlide: number;
////}

//interface UserName {
//	given_name: string[],
//	family_name: string[]
//}


//interface ClientSupportStructureProps {
//	id: number;
//	user: User;
//	client: Client;
//	projections: any;
//	survey: any;
//	session: any;
//}

//interface UserData {
//	recipient: string;
//	spouse: string[];
//	children: string[];
//}

//interface PhysicalCare {
//	relation: string;
//	name: string;
//}

//interface Supporter {
//	id?: string;
//	name?: string;
//	relation?: string;
//	role?: string;
//	careLevel?: number;
//	label?: string;
//	hoursPerMonth: number;
//	totalYears: number;
//}

//interface Support {
//	isUpdated: boolean;
//	careMembers: Supporter[];
//}

//interface Node {
//	id: string;
//	position: { x: number; y: number };
//	data: SupportProvider;
//	type: string;
//}

//interface Edge {
//	id: string;
//	source: string;
//	target: string;
//	type: string;
//	markerEnd?: {
//		type: string;
//	};
//}

//interface Graph {
//	nodes: Node[];
//	edges: Edge[];
//}

//interface Opportunity {
//	redirect: string;
//	lines: string[];
//}

//interface Trajectory {
//	projections: any;
//	opportunities: Opportunity[];
//}

//interface NodeProps {
//	supportProvider: SupportProvider;
//}

//interface Ltc {
//	likelihood: number;
//	likelihood5Years: number;
//	likelihood10Years: number;
//	likelihoodConfidence: number;
//	trajectory: any;
//	ltcFamilyCareCost: number;
//	ltcTotalCost: number;
//  ltcProfessionalShareCost: number;
//  trajectoryConfidence: any;
//  totalCareHoursNeeded: number;
//  monthlyHelpHours: number;
//	respondentAge: number[];
//	ageConfidence: number;
//	age: number;
//	familyProfessionalHelpConfidence: number;
//	span: any;
//}

//interface CareData {
//	longTermCare: Ltc;
//	ltc: Ltc;
//	support: { physicalCare: PhysicalCare };
//}

////interface Survey {
////	client: Client;
////	support: Support;
////}
