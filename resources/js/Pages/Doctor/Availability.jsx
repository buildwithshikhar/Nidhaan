import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Availability({ availabilities }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        date: '',
        start_time: '',
        end_time: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor.availability.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <DoctorLayout>
            <Head title="Manage Availability" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Add New Slot Form */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <header className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Add New Availability Slot</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Set a specific date, start time, and end time when you are available for appointments.
                            </p>
                        </header>

                        <form onSubmit={submit} className="space-y-6 max-w-xl">
                            <div>
                                <InputLabel htmlFor="date" value="Date" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    name="date"
                                    value={data.date}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('date', e.target.value)}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="start_time" value="Start Time" />
                                    <TextInput
                                        id="start_time"
                                        type="time"
                                        name="start_time"
                                        value={data.start_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        required
                                    />
                                    {errors.start_time && <p className="mt-2 text-sm text-red-600">{errors.start_time}</p>}
                                </div>

                                <div>
                                    <InputLabel htmlFor="end_time" value="End Time" />
                                    <TextInput
                                        id="end_time"
                                        type="time"
                                        name="end_time"
                                        value={data.end_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        required
                                    />
                                    {errors.end_time && <p className="mt-2 text-sm text-red-600">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
                                    Add Slot
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* Current Availability List */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <header className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Your Upcoming Availability</h2>
                        </header>

                        {availabilities.length === 0 ? (
                            <p className="text-gray-500 text-sm">No upcoming availability slots found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3">Start Time</th>
                                            <th scope="col" className="px-6 py-3">End Time</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availabilities.map((slot) => (
                                            <tr key={slot.id} className="bg-white border-b">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {new Date(slot.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {slot.start_time.substring(0, 5)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {slot.end_time.substring(0, 5)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {slot.is_booked ? (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Booked</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Available</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DoctorLayout>
    );
}
