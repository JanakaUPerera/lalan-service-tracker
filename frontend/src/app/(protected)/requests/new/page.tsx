import { CreateRequestForm } from '@/features/requests/components/create-request-form';

export default function NewRequestPage() {
  return (
    <div className="row">
      <div className="col-12 col-lg-8">
        <h1 className="h4 mb-3">New request</h1>
        <div className="card">
          <div className="card-body">
            <CreateRequestForm />
          </div>
        </div>
      </div>
    </div>
  );
}