import DescriptionFile from "./DescriptionFile";
import { Service } from "./Service";
import Shortener from "./Shortener";
import { CertificateRequest } from "../certificate/CertificateRequest.entity";

const entityList = [
    Service,
    DescriptionFile,
    Shortener,
    CertificateRequest,
];

export default entityList;