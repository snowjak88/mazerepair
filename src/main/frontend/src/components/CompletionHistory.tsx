import React from 'react';

type CompletionHistoryProps = {
    registerCompletionListener: (listener: (moveCount: number) => void) => void;
    unregisterCompletionListener: () => void;
};

type CompletionHistoryState = {
    totalCompletions: number;
    totalMoves: number;
};

class CompletionHistory extends React.Component<CompletionHistoryProps, CompletionHistoryState> {
    constructor(props: CompletionHistoryProps) {
        super(props);
        this.state = {
            totalCompletions: 0,
            totalMoves: 0
        };
    }

    private completionListener = (moveCount: number) => {
        this.setState({
            totalCompletions: this.state.totalCompletions + 1,
            totalMoves: this.state.totalMoves + moveCount
        }, this.saveCompletionHistory);
    };

    componentDidMount() {
        super.componentDidMount?.();

        this.props.registerCompletionListener(this.completionListener);

        if(typeof(Storage) !== "undefined") {
            const totalCompletions = localStorage.getItem("totalCompletions");
            const totalMoves = localStorage.getItem("totalMoves");

            if(totalCompletions !== null && totalMoves !== null) {
                this.setState({
                    totalCompletions: parseInt(totalCompletions),
                    totalMoves: parseInt(totalMoves)
                });
            }
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount?.();

        this.props.unregisterCompletionListener();

        this.saveCompletionHistory();
    }

    saveCompletionHistory() {
        console.log("Attempting to save completion history");
        if(typeof(Storage) !== "undefined") {
            console.log("Saving completion history");
            localStorage.setItem("totalCompletions", this.state.totalCompletions.toString());
            localStorage.setItem("totalMoves", this.state.totalMoves.toString());
        }
    }

    render() {
        return (
            <div className="completionHistory">
                <table>
                    <thead>
                        <tr>
                            <th colSpan={2}>Stats</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Games Played</td>
                            <td>{this.state.totalCompletions}</td>
                        </tr>
                        <tr>
                            <td>Avg Moves/Win</td>
                            <td>{(this.state.totalCompletions === 0) ? 0 : this.state.totalMoves / this.state.totalCompletions}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default CompletionHistory;