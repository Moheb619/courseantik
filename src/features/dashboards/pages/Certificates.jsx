import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Download,
  Eye,
  Share2,
  Calendar,
  CheckCircle,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import { dummyCertificates } from "../../../data/dummyData";
import Button from "../../../components/ui/Button";

const Certificates = () => {
  const [certificates] = useState(dummyCertificates);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = cert.courseTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || cert.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (certificateId) => {
    console.log(`Downloading certificate: ${certificateId}`);
    alert(`Certificate ${certificateId} downloaded successfully!`);
  };

  const handleShare = (certificateId) => {
    console.log(`Sharing certificate: ${certificateId}`);
    const verificationUrl = `${window.location.origin}/certificate/verify/${certificateId}`;
    navigator.clipboard.writeText(verificationUrl);
    alert("Certificate verification link copied to clipboard!");
  };

  const handleView = (certificateId) => {
    console.log(`Viewing certificate: ${certificateId}`);
    window.open(`/certificate/view/${certificateId}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                My Certificates
              </h1>
              <p className="text-neutral-600 mt-1">
                Your learning achievements and credentials
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
              <Link to="/courses">
                <Button variant="primary" size="sm">
                  <Award className="w-4 h-4 mr-2" />
                  Earn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Certificates
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {certificates.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  This Year
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {
                    certificates.filter(
                      (cert) =>
                        new Date(cert.completedDate).getFullYear() ===
                        new Date().getFullYear()
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Verified</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {certificates.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Shareable
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {certificates.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Certificates</option>
                <option value="recent">Recent</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="space-y-6">
          {filteredCertificates.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No certificates found
              </h3>
              <p className="text-neutral-600 mb-6">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Complete courses to earn your first certificate!"}
              </p>
              <Link to="/courses">
                <Button variant="primary">
                  <Award className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Certificate Header */}
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {cert.courseTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Calendar className="w-4 h-4" />
                          Completed on{" "}
                          {new Date(cert.completedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Certificate ID: {cert.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Certificate Preview */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Award className="w-6 h-6 text-yellow-600" />
                          </div>
                          <h4 className="font-semibold text-neutral-900 text-sm">
                            Certificate of Completion
                          </h4>
                          <p className="text-xs text-neutral-600 mt-1">
                            This certifies that the student has successfully
                            completed the course
                          </p>
                        </div>
                      </div>

                      {/* Certificate Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Status</span>
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Type</span>
                          <span className="text-neutral-900">
                            Digital Certificate
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Format</span>
                          <span className="text-neutral-900">PDF</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Actions */}
                  <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleView(cert.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(cert.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(cert.id)}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      <Link
                        to={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" fullWidth>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify Online
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificate Information */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            About Your Certificates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">
                Digital Verification
              </h4>
              <p className="text-sm text-neutral-600">
                Each certificate comes with a unique verification URL that can
                be shared with employers or educational institutions to verify
                authenticity.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">
                Professional Standards
              </h4>
              <p className="text-sm text-neutral-600">
                Our certificates meet industry standards and can be used for
                professional development, job applications, and continuing
                education credits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
