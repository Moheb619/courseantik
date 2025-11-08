import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  Download,
  Share2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { dummyCertificates } from "../../../data/dummyData";
import Button from "../../../components/ui/Button";

const CertificateVerify = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Simulate API call to verify certificate
    const verifyCertificate = async () => {
      setIsLoading(true);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Find certificate in dummy data
      const foundCert = dummyCertificates.find(
        (cert) => cert.id === certificateId
      );

      if (foundCert) {
        setCertificate(foundCert);
        setIsValid(true);
      } else {
        setIsValid(false);
      }

      setIsLoading(false);
    };

    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const handleDownload = () => {
    if (certificate) {
      console.log(`Downloading certificate: ${certificate.id}`);
      alert(`Certificate ${certificate.id} downloaded successfully!`);
    }
  };

  const handleShare = () => {
    if (certificate) {
      const verificationUrl = `${window.location.origin}/certificate/verify/${certificate.id}`;
      navigator.clipboard.writeText(verificationUrl);
      alert("Certificate verification link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Verifying Certificate
          </h2>
          <p className="text-neutral-600">
            Please wait while we verify the certificate...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900">
              Certificate Verification
            </h1>
            <p className="text-neutral-600 mt-1">
              Verify the authenticity of a certificate
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isValid && certificate ? (
          <div className="space-y-8">
            {/* Verification Success */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Certificate Verified
                </h2>
                <p className="text-neutral-600">
                  This certificate has been successfully verified and is
                  authentic.
                </p>
              </div>

              {/* Certificate Details */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                    Certificate of Completion
                  </h3>
                  <p className="text-lg text-neutral-600">
                    This certifies that the student has successfully completed
                  </p>
                  <h4 className="text-2xl font-semibold text-neutral-900 mt-4">
                    {certificate.courseTitle}
                  </h4>
                </div>

                {/* Certificate Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Student Name</p>
                        <p className="font-semibold text-neutral-900">
                          John Doe
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Course</p>
                        <p className="font-semibold text-neutral-900">
                          {certificate.courseTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">
                          Completion Date
                        </p>
                        <p className="font-semibold text-neutral-900">
                          {new Date(
                            certificate.completedDate
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">
                          Certificate ID
                        </p>
                        <p className="font-semibold text-neutral-900">
                          {certificate.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg" onClick={handleDownload}>
                  <Download className="w-5 h-5 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Verification
                </Button>
              </div>
            </div>

            {/* Verification Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Verification Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">
                    Verification Status
                  </h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Verified</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">
                    Verification Date
                  </h4>
                  <p className="text-neutral-600">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">
                    Certificate Type
                  </h4>
                  <p className="text-neutral-600">Digital Certificate</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">
                    Issuing Authority
                  </h4>
                  <p className="text-neutral-600">Course Antik</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Certificate Not Found
            </h2>
            <p className="text-neutral-600 mb-6">
              The certificate with ID "{certificateId}" could not be found or
              verified.
            </p>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Possible reasons:</span>
                </div>
                <ul className="text-sm text-yellow-600 mt-2 space-y-1">
                  <li>• The certificate ID is incorrect</li>
                  <li>• The certificate has been revoked</li>
                  <li>• The certificate is not yet issued</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button variant="primary">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerify;
